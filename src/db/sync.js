// db/sync.js
import { db } from './index'
import { supabase } from './supabase'
import { productToRow, categoryToRow, movementToRow } from './syncMappers'

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
}
    const pending = await db.syncQueue.orderBy('seq').toArray()

    for (const item of pending) {
      const handler = handlers[item.table]
      if (!handler) continue
      try {
        await handler(item)
        await db.syncQueue.delete(item.seq)
      } catch (err) {
        await db.syncQueue.update(item.seq, { lastError: err.message })
        console.error('Sync failed for', item, err)
      }
    }
  } finally {
    running = false
  }
}

async function pushCategory(item) {
  const category = await db.categories.get(item.recordId)
  if (!category) return

  const { error } = await supabase.from('categories').upsert(categoryToRow(category))
  if (error) throw error

  await db.categories.update(category.id, { synced: 1 })
}

async function pushProduct(item) {
  const product = await db.products.get(item.recordId)
  if (!product) return

  const { error } = await supabase.from('products').upsert(productToRow(product))
  if (error) throw error

  await db.products
    .where('id').equals(product.id)
    .and((p) => p.lastUpdated === product.lastUpdated)
    .modify({ synced: 1 })
}
async function pushStockMovement(item) {
  const movement = await db.stockMovements.get(item.recordId)
  if (!movement) return
  if (movement.saleId) return

  const { error } = await supabase
    .from('stock_movements')
    .upsert(movementToRow(movement), { onConflict: 'id', ignoreDuplicates: true })
  if (error) throw error

  await db.stockMovements.update(movement.id, { synced: 1 })
}