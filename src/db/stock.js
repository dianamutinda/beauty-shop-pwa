import { db } from './index'
import { getShopId } from './shop'

const MOVEMENT_TYPES = ['restock', 'sale', 'adjustment']

export async function recordStockMovement(
  productId,
  type,
  quantity,
  { note = '', allowNegative = false } = {}
) {
  if (!MOVEMENT_TYPES.includes(type)) {
    throw new Error(`Unknown movement type: ${type}`)
  }

  const change = Number(quantity)
  if (!Number.isInteger(change) || change === 0) {
    throw new Error('Quantity must be a whole number other than zero')
  }
  if (type === 'restock' && change < 0) throw new Error('A restock must be positive')
  if (type === 'sale' && change > 0) throw new Error('A sale must be negative')

  const shopId = await getShopId()
  const timestamp = new Date().toISOString()

  return db.transaction('rw', db.products, db.stockMovements, async () => {
    const product = await db.products.get(productId)
    if (!product) throw new Error(`Product ${productId} not found`)

    const newStock = product.stock + change
    if (newStock < 0 && !allowNegative) {
      throw new Error(`Only ${product.stock} in stock for ${product.name}`)
    }

    await db.stockMovements.add({
      id: crypto.randomUUID(),
      shopId,
      productId,
      type,
      quantity: change,
      note,
      timestamp,
      synced: 0,
    })

    await db.products.update(productId, {
      stock: newStock,
      lastUpdated: timestamp,
      synced: 0,
    })

    return newStock
  })
}

export async function listMovements(productId) {
  const rows = await db.stockMovements
    .where('productId')
    .equals(productId)
    .sortBy('timestamp')
  return rows.reverse() // newest first
}