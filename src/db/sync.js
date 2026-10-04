
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

  // Sales are handled separately through record_sale.
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

  /*
   * A stock movement can be unsynced even when it has
   * no syncQueue entry.
   *
   * This currently matters for local sales and voids,
   * because those movements change local product stock
   * but are not yet queued for server sync.
   *
   * Protect the affected products from being overwritten
   * by the server's older stock value.
   */
  const unsyncedMovements = await db.stockMovements
    .filter((m) => m.synced === 0)
    .toArray()

  const protectedProductIds = new Set(
    unsyncedMovements.map(
      (m) => m.productId
    )
  )

  const { data: cats, error: cErr } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shopId)

  if (cErr) throw cErr

  const { data: prods, error: pErr } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)

  if (pErr) throw pErr

  await db.transaction(
    'rw',
    db.categories,
    db.products,
    async () => {
      for (const r of cats) {
        if (!pendingIds.has(r.id)) {
          await db.categories.put(
            rowToCategory(r)
          )
        }
      }

      for (const r of prods) {
        if (
          !pendingIds.has(r.id) &&
          !protectedProductIds.has(r.id)
        ) {
          await db.products.put(
            rowToProduct(r)
          )
        }
      }
    }
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
export async function syncAll() {
  await syncPendingChanges()

  try {
    await pullShopData()
  } catch (err) {
    console.error('Pull failed', err)
  }
}