import { db } from './index'
import { supabase } from './supabase'
import {
  productToRow,
  categoryToRow,
  movementToRow,
  rowToCategory,
  rowToProduct,
} from './syncMappers'
import { getShopId } from './shop'

let running = false

let status = { syncing: false, lastSyncAt: null, lastError: null }
const listeners = new Set()

function setStatus(patch) {
  status = { ...status, ...patch }
  listeners.forEach((fn) => fn(status))
}

export function subscribeSyncStatus(fn) {
  listeners.add(fn)
  fn(status)
  return () => listeners.delete(fn)
}

export async function syncPendingChanges() {
  if (running || !navigator.onLine) return

  running = true

  try {
    const { data } = await supabase.auth.getSession()

    if (!data.session) return

    const handlers = {
      categories: pushCategory,
      products: pushProduct,
      stockMovements: pushStockMovement,
      sales: pushSale,
      voids: pushVoid,
      activity: pushActivity,
    }

    const pending = await db.syncQueue
      .orderBy('seq')
      .toArray()

    for (const item of pending) {
      const handler = handlers[item.table]

      if (!handler) continue

      try {
        await handler(item)
        await db.syncQueue.delete(item.seq)
      } catch (err) {
        await db.syncQueue.update(item.seq, {
          lastError: err.message,
        })

        console.error('Sync failed for', item, err)
      }
    }
  } finally {
    running = false
  }
}

async function pushCategory(item) {
  if (item.op === 'delete') {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', item.recordId)

    if (error) throw error

    return
  }

  const category = await db.categories.get(item.recordId)

  if (!category) return

  const { error } = await supabase
    .from('categories')
    .upsert(categoryToRow(category))

  if (error) throw error

  await db.categories.update(category.id, {
    synced: 1,
  })
}

async function pushProduct(item) {
  const product = await db.products.get(item.recordId)

  if (!product) return

  const { error } = await supabase
    .from('products')
    .upsert(productToRow(product))

  if (error) throw error

  await db.products
    .where('id')
    .equals(product.id)
    .and((p) => p.lastUpdated === product.lastUpdated)
    .modify({ synced: 1 })
}

async function pushStockMovement(item) {
  const movement = await db.stockMovements.get(
    item.recordId
  )

  if (!movement) return

  // Sales and voids are handled separately through the RPCs.
  if (movement.saleId) return

  const { error } = await supabase
    .from('stock_movements')
    .upsert(
      movementToRow(movement),
      {
        onConflict: 'id',
        ignoreDuplicates: true,
      }
    )

  if (error) throw error

  await db.stockMovements.update(
    movement.id,
    { synced: 1 }
  )
}

async function pushSale(item) {
  const movements = await db.stockMovements
    .where('saleId').equals(item.recordId)
    .filter((m) => m.type === 'sale')
    .toArray()

  // Nothing local to send: drop the queue row.
  if (movements.length === 0) return

  const items = movements.map((m) => ({
    productId: m.productId,
    quantity: -m.quantity,
    unitPrice: m.unitPrice,
    listPrice: m.listPrice,
    note: m.note,
  }))

  const { error } = await supabase.rpc('record_sale', {
    p_items: items,
    p_payment_method: movements[0].paymentMethod ?? null,
    p_sale_id: item.recordId,
    p_timestamp: movements[0].timestamp,
  })
  if (error) throw error

  await db.stockMovements
    .where('saleId').equals(item.recordId)
    .filter((m) => m.type === 'sale')
    .modify({ synced: 1 })
}

async function pushVoid(item) {
  const voidRows = await db.stockMovements
    .where('saleId').equals(item.recordId)
    .filter((m) => m.type === 'void')
    .toArray()

  // No local void to send: drop the queue row.
  if (voidRows.length === 0) return

  const { error } = await supabase.rpc('void_sale', {
    p_sale_id: item.recordId,
    p_timestamp: voidRows[0].timestamp,
  })
  if (error) throw error

  await db.stockMovements
    .where('saleId').equals(item.recordId)
    .filter((m) => m.type === 'void')
    .modify({ synced: 1 })
}

// Owners read the products table. Everyone else reads the
// products_for_worker view, which has no buying price.
async function getMyRole() {
  const { data: u } = await supabase.auth.getUser()

  if (!u?.user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', u.user.id)
    .single()

  if (error) throw error

  return data.role
}

export async function pullShopData() {
  if (!navigator.onLine) return

  const shopId = await getShopId()

  // Never overwrite records that still have a pending
  // local change in the sync queue.
  const pendingIds = new Set(
    (await db.syncQueue.toArray()).map(
      (q) => q.recordId
    )
  )

  // A product whose latest sale, void or stock change hasn't
  // reached the server yet keeps its local stock.
  const unsyncedMovements = await db.stockMovements
    .filter((m) => m.synced === 0)
    .toArray()

  const protectedProductIds = new Set(
    unsyncedMovements.map(
      (m) => m.productId
    )
  )

  // Only products that actually exist locally can be protected
  // by an unsynced movement.
  const localProductIds = new Set(
    (await db.products.toCollection().primaryKeys())
  )

  const role = await getMyRole()

  const productSource =
    role === 'owner' ? 'products' : 'products_for_worker'

  const { data: cats, error: cErr } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shopId)

  if (cErr) throw cErr

  const { data: prods, error: pErr } = await supabase
    .from(productSource)
    .select('*')
    .eq('shop_id', shopId)

  if (pErr) throw pErr

  // Only the owner pulls the shop's activity log and member
  // names. Workers keep the rows they wrote themselves.
  let acts = []
  let members = []

  if (role === 'owner') {
    const { data, error: aErr } = await supabase
      .from('activity')
      .select('*')
      .eq('shop_id', shopId)
      .order('timestamp', { ascending: false })
      .limit(200)

    if (aErr) throw aErr

    acts = data

    const { data: mems, error: mErr } = await supabase
      .from('profiles')
      .select('id, role, display_name')
      .eq('shop_id', shopId)

    if (mErr) throw mErr

    members = mems
  }

  // Category ids the server has right now, used to detect
  // categories that were deleted on another device.
  const serverCatIds = new Set(cats.map((r) => r.id))

  await db.transaction(
    'rw',
    db.categories,
    db.products,
    db.activity,
    db.settings,
    async () => {
      // 1. Add and update categories from the server
      for (const r of cats) {
        if (!pendingIds.has(r.id)) {
          await db.categories.put({
            ...rowToCategory(r),
            synced: 1,
          })
        }
      }

      // 2. Remove local categories the server no longer has
      const localCats = await db.categories.toArray()

      for (const c of localCats) {
        if (
          !serverCatIds.has(c.id) &&
          c.synced === 1 &&
          !pendingIds.has(c.id)
        ) {
          await db.categories.delete(c.id)
        }
      }

      // 3. Add and update products
      for (const r of prods) {
        const hasLocalRow = localProductIds.has(r.id)

        const isProtected =
          hasLocalRow && protectedProductIds.has(r.id)

        if (!pendingIds.has(r.id) && !isProtected) {
          await db.products.put(
            rowToProduct(r)
          )
        }
      }

      // 4. Add activity from other devices (owner only)
      for (const r of acts) {
        if (!pendingIds.has(r.id)) {
          await db.activity.put({
            id: r.id,
            shopId: r.shop_id,
            userId: r.user_id,
            action: r.action,
            details: r.details,
            timestamp: r.timestamp,
            synced: 1,
          })
        }
      }

      // 5. Remember who the shop's members are (owner only), so
      // the activity screen can show names offline
      if (members.length > 0) {
        await db.settings.put({
          key: 'shopMembers',
          value: members,
        })
      }
    }
  )
}

export async function syncAll() {
  await syncPendingChanges()

  try {
    await pullShopData()
    setStatus({ lastSyncAt: Date.now() })
  } catch (err) {
    setStatus({ lastError: err.message })
    console.error('Pull failed', err)
  }
}
async function pushActivity(item) {
  const row = await db.activity.get(item.recordId)
  if (!row) return

  const { error } = await supabase
    .from('activity')
    .upsert(
      {
        id: row.id,
        shop_id: row.shopId,
        user_id: row.userId,
        action: row.action,
        details: row.details,
        timestamp: row.timestamp,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  if (error) throw error

  await db.activity.update(row.id, { synced: 1 })
}