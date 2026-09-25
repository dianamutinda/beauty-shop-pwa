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

export async function voidSale(saleId) {
  const movements = await db.stockMovements.where('saleId').equals(saleId).toArray()

  if (movements.length === 0) {
    throw new Error(`No sale found with id ${saleId}`)
  }
  if (movements.some((m) => m.voidedAt)) {
    throw new Error('This sale has already been voided')
  }

  const shopId = await getShopId()
  const timestamp = new Date().toISOString()

  return db.transaction('rw', db.products, db.stockMovements, async () => {
    for (const original of movements) {
      const reversalQty = -original.quantity // sale was negative, this flips it positive

      const product = await db.products.get(original.productId)
      if (!product) throw new Error(`Product ${original.productId} not found`)

      const newStock = product.stock + reversalQty

      await db.stockMovements.add({
        id: crypto.randomUUID(),
        shopId,
        productId: original.productId,
        type: 'void',
        quantity: reversalQty,
        note: 'Void of sale',
        unitPrice: original.unitPrice,
        listPrice: original.listPrice,
        timestamp,
        saleId, // same saleId, stays grouped with what it's reversing
        voidOf: original.id,
        paymentMethod: original.paymentMethod,
        synced: 0,
      })

      await db.products.update(original.productId, {
        stock: newStock,
        lastUpdated: timestamp,
        synced: 0,
      })

      // mark the original line as voided so it can't be voided twice
      await db.stockMovements.update(original.id, { voidedAt: timestamp })
    }

    return { saleId, voidedAt: timestamp }
  })
}
export async function listTodaysSales() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const startIso = startOfDay.toISOString()

  // Filter (not an indexed .where()) because timestamp isn't an indexed
  // field on stockMovements — fine at one shop's daily volume.
  const movements = await db.stockMovements
    .filter((m) => m.type === 'sale' && !!m.saleId && m.timestamp >= startIso)
    .toArray()

  const productIds = [...new Set(movements.map((m) => m.productId))]
  const products = await db.products.bulkGet(productIds)
  const productById = new Map(products.filter(Boolean).map((p) => [p.id, p]))

  const bySale = new Map()
  for (const m of movements) {
    if (!bySale.has(m.saleId)) {
      bySale.set(m.saleId, {
        saleId: m.saleId,
        timestamp: m.timestamp,
        paymentMethod: m.paymentMethod,
        voided: false,
        items: [],
        total: 0,
      })
    }
    const sale = bySale.get(m.saleId)
    if (m.voidedAt) sale.voided = true

    const quantity = -m.quantity // sale movements store quantity as negative
    sale.items.push({
      productId: m.productId,
      name: productById.get(m.productId)?.name ?? 'Unknown product',
      quantity,
      unitPrice: m.unitPrice,
    })
    sale.total += quantity * (m.unitPrice ?? 0)
  }

  return [...bySale.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}