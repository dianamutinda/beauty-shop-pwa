import { db } from './index'
import { getShopId } from './shop'

const MOVEMENT_TYPES = ['restock', 'sale', 'adjustment']

export async function recordStockMovement(
  productId,
  type,
  quantity,
  { note = '', allowNegative = false, unitPrice = null, listPrice = null } = {}
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

  for (const price of [unitPrice, listPrice]) {
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      throw new Error('Prices must be numbers, 0 or more')
    }
  }

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
      unitPrice,
      listPrice,
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

export async function applyStockCount(counts) {
  for (const { counted } of counts) {
    if (!Number.isInteger(counted) || counted < 0) {
      throw new Error('Counts must be whole numbers, 0 or more')
    }
  }

  const shopId = await getShopId()
  const timestamp = new Date().toISOString()

  return db.transaction('rw', db.products, db.stockMovements, async () => {
    let adjusted = 0

    for (const { productId, counted } of counts) {
      const product = await db.products.get(productId)
      if (!product) continue

      const difference = counted - product.stock
      if (difference === 0) continue

      await db.stockMovements.add({
        id: crypto.randomUUID(),
        shopId,
        productId,
        type: 'adjustment',
        quantity: difference,
        note: 'Stock count',
        timestamp,
        synced: 0,
      })

      await db.products.update(productId, {
        stock: counted,
        lastUpdated: timestamp,
        synced: 0,
      })

      adjusted++
    }

    return adjusted
  })
}
export async function recordSale(items, paymentMethod = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('A sale needs at least one item')
  }
  for (const { productId, quantity, unitPrice, listPrice } of items) {
    if (!productId) throw new Error('Each item needs a productId')
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a whole number greater than zero')
    }
    for (const price of [unitPrice, listPrice]) {
      if (price !== null && price !== undefined && (!Number.isFinite(price) || price < 0)) {
        throw new Error('Prices must be numbers, 0 or more')
      }
    }
  }

  const shopId = await getShopId()
  const saleId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  return db.transaction('rw', db.products, db.stockMovements, async () => {
    const results = []

    for (const { productId, quantity, unitPrice, listPrice, note } of items) {
      const product = await db.products.get(productId)
      if (!product) throw new Error(`Product ${productId} not found`)

      const newStock = product.stock - quantity
      if (newStock < 0) {
        throw new Error(`Only ${product.stock} in stock for ${product.name}`)
      }

      await db.stockMovements.add({
        id: crypto.randomUUID(),
        shopId,
        productId,
        type: 'sale',
        quantity: -quantity,
        note: note || 'Sold',
        unitPrice: unitPrice ?? product.sellingPrice,
        listPrice: listPrice ?? product.sellingPrice,
        timestamp,
        saleId,
        paymentMethod,
        synced: 0,
      })

      await db.products.update(productId, {
        stock: newStock,
        lastUpdated: timestamp,
        synced: 0,
      })

      results.push({ productId, newStock })
    }

    return { saleId, results }
  })
}