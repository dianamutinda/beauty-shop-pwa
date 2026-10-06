import { db } from './index'
import { getShopId } from './shop'
import { addActivity } from './activity'
import { enqueue } from './syncQueue'

const MOVEMENT_TYPES = ['restock', 'sale', 'adjustment']

export async function recordStockMovement(
  productId,
  type,
  quantity,
  {
    note = '',
    allowNegative = false,
    unitPrice = null,
    listPrice = null,
  } = {}
) {
  if (!MOVEMENT_TYPES.includes(type)) {
    throw new Error(`Unknown movement type: ${type}`)
  }

  const change = Number(quantity)

  if (!Number.isInteger(change) || change === 0) {
    throw new Error(
      'Quantity must be a whole number other than zero'
    )
  }

  if (type === 'restock' && change < 0) {
    throw new Error('A restock must be positive')
  }

  if (type === 'sale' && change > 0) {
    throw new Error('A sale must be negative')
  }

  for (const price of [unitPrice, listPrice]) {
    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0)
    ) {
      throw new Error('Prices must be numbers, 0 or more')
    }
  }

  const shopId = await getShopId()
  const timestamp = new Date().toISOString()

  return db.transaction(
    'rw',
    db.products,
    db.stockMovements,
    db.activity,
    db.syncQueue,
    async () => {
      const product = await db.products.get(productId)

      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      const newStock = product.stock + change

      if (newStock < 0 && !allowNegative) {
        throw new Error(
          `Only ${product.stock} in stock for ${product.name}`
        )
      }

      const movementId = crypto.randomUUID()

      await db.stockMovements.add({
        id: movementId,
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

      // Sales must go through record_sale, so only queue
      // non-sale stock movements here.
      if (type !== 'sale') {
        await enqueue('stockMovements', movementId)

        // Sales are logged by recordSale, so only log the rest.
        await addActivity(shopId, `stock.${type}`, {
          productId,
          productName: product.name,
          quantity: change,
          newStock,
          note,
        })
      }

      await db.products.update(productId, {
        stock: newStock,
        lastUpdated: timestamp,
        synced: 0,
      })

      return newStock
    }
  )
}

export async function listMovements(productId) {
  const rows = await db.stockMovements
    .where('productId')
    .equals(productId)
    .sortBy('timestamp')

  return rows.reverse()
}

export async function applyStockCount(counts) {
  for (const { counted } of counts) {
    if (!Number.isInteger(counted) || counted < 0) {
      throw new Error(
        'Counts must be whole numbers, 0 or more'
      )
    }
  }

  const shopId = await getShopId()
  const timestamp = new Date().toISOString()

  return db.transaction(
    'rw',
    db.products,
    db.stockMovements,
    db.activity,
    db.syncQueue,
    async () => {
      let adjusted = 0
      const changes = []

      for (const { productId, counted } of counts) {
        const product = await db.products.get(productId)

        if (!product) continue

        const difference = counted - product.stock

        if (difference === 0) continue

        const movementId = crypto.randomUUID()

        await db.stockMovements.add({
          id: movementId,
          shopId,
          productId,
          type: 'adjustment',
          quantity: difference,
          note: 'Stock count',
          timestamp,
          synced: 0,
        })

        await enqueue('stockMovements', movementId)

        await db.products.update(productId, {
          stock: counted,
          lastUpdated: timestamp,
          synced: 0,
        })

        changes.push({
          productId,
          name: product.name,
          difference,
        })

        adjusted++
      }

      // One activity entry for the whole count, only if
      // something actually changed.
      if (adjusted > 0) {
        await addActivity(shopId, 'stock.counted', {
          adjusted,
          changes,
        })
      }

      return adjusted
    }
  )
}

/**
 * Temporary recovery helper.
 *
 * Re-queues local stock movements that were created but never
 * added to the sync queue.
 *
 * Remove this helper after the existing unsynced movements
 * have been recovered.
 */
export async function requeueUnsyncedMovements() {
  const rows = await db.stockMovements
    .filter(
      (m) =>
        m.synced === 0 &&
        !m.saleId &&
        m.type !== 'sale' &&
        m.type !== 'void'
    )
    .toArray()

  for (const movement of rows) {
    await enqueue('stockMovements', movement.id)
  }

  return rows.length
}

export async function recordSale(
  items,
  paymentMethod = null
) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('A sale needs at least one item')
  }

  for (const {
    productId,
    quantity,
    unitPrice,
    listPrice,
  } of items) {
    if (!productId) {
      throw new Error('Each item needs a productId')
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(
        'Quantity must be a whole number greater than zero'
      )
    }

    for (const price of [unitPrice, listPrice]) {
      if (
        price !== null &&
        price !== undefined &&
        (!Number.isFinite(price) || price < 0)
      ) {
        throw new Error('Prices must be numbers, 0 or more')
      }
    }
  }

  const shopId = await getShopId()
  const saleId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  return db.transaction(
    'rw',
    db.products,
    db.stockMovements,
    db.activity,
    db.syncQueue,
    async () => {
      const results = []
      let total = 0

      for (const {
        productId,
        quantity,
        unitPrice,
        listPrice,
        note,
      } of items) {
        const product = await db.products.get(productId)

        if (!product) {
          throw new Error(`Product ${productId} not found`)
        }

        const newStock = product.stock - quantity

        if (newStock < 0) {
          throw new Error(
            `Only ${product.stock} in stock for ${product.name}`
          )
        }

        const saleUnitPrice = unitPrice ?? product.sellingPrice
        const saleListPrice = listPrice ?? product.sellingPrice

        await db.stockMovements.add({
          id: crypto.randomUUID(),
          shopId,
          productId,
          type: 'sale',
          quantity: -quantity,
          note: note || 'Sold',
          unitPrice: saleUnitPrice,
          listPrice: saleListPrice,
          timestamp,
          saleId,
          paymentMethod,
          synced: 0,
        })

        total += quantity * saleUnitPrice

        await db.products.update(productId, {
          stock: newStock,
          lastUpdated: timestamp,
          synced: 0,
        })

        results.push({
          productId,
          newStock,
        })
      }

      // One entry per sale: the server records the whole basket at once.
      await enqueue('sales', saleId)

      await addActivity(shopId, 'sale.recorded', {
        saleId,
        total,
        itemCount: items.length,
        paymentMethod,
      })

      return {
        saleId,
        results,
      }
    }
  )
}

export async function voidSale(saleId) {
  const movements = await db.stockMovements
    .where('saleId')
    .equals(saleId)
    .toArray()

  if (movements.length === 0) {
    throw new Error(`No sale found with id ${saleId}`)
  }

  if (movements.some((m) => m.voidedAt)) {
    throw new Error('This sale has already been voided')
  }

  const shopId = await getShopId()
  const timestamp = new Date().toISOString()

  const total = movements.reduce(
    (sum, movement) =>
      sum + -movement.quantity * (movement.unitPrice ?? 0),
    0
  )

  return db.transaction(
    'rw',
    db.products,
    db.stockMovements,
    db.activity,
    db.syncQueue,
    async () => {
      for (const original of movements) {
        const reversalQty = -original.quantity

        const product = await db.products.get(original.productId)

        if (!product) {
          throw new Error(`Product ${original.productId} not found`)
        }

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
          saleId,
          voidOf: original.id,
          paymentMethod: original.paymentMethod,
          synced: 0,
        })

        await db.products.update(original.productId, {
          stock: product.stock + reversalQty,
          lastUpdated: timestamp,
          synced: 0,
        })

        await db.stockMovements.update(original.id, {
          voidedAt: timestamp,
        })
      }

      // One entry per sale: the server reverses every item in one call.
      await enqueue('voids', saleId)

      await addActivity(shopId, 'sale.voided', {
        saleId,
        total,
      })

      return {
        saleId,
        voidedAt: timestamp,
      }
    }
  )
}

export async function listSales({ from, to } = {}) {
  const shopId = await getShopId()

  const movements = await db.stockMovements
    .where('shopId')
    .equals(shopId)
    .filter((m) => {
      if (m.type !== 'sale' || !m.saleId) {
        return false
      }

      if (from && m.timestamp < from) {
        return false
      }

      if (to && m.timestamp >= to) {
        return false
      }

      return true
    })
    .toArray()

  const productIds = [
    ...new Set(
      movements.map((m) => m.productId)
    ),
  ]

  const products = await db.products.bulkGet(productIds)

  const productById = new Map(
    products
      .filter(Boolean)
      .map((product) => [
        product.id,
        product,
      ])
  )

  const bySale = new Map()

  for (const movement of movements) {
    if (!bySale.has(movement.saleId)) {
      bySale.set(movement.saleId, {
        saleId: movement.saleId,
        timestamp: movement.timestamp,
        paymentMethod: movement.paymentMethod,
        voided: false,
        items: [],
        total: 0,
      })
    }

    const sale = bySale.get(movement.saleId)

    if (movement.voidedAt) {
      sale.voided = true
    }

    const quantity = -movement.quantity

    sale.items.push({
      productId: movement.productId,
      name:
        productById.get(movement.productId)?.name ??
        'Unknown product',
      quantity,
      unitPrice: movement.unitPrice,
      listPrice: movement.listPrice,
    })

    sale.total +=
      quantity *
      (movement.unitPrice ?? 0)
  }

  return [...bySale.values()].sort(
    (a, b) =>
      b.timestamp.localeCompare(
        a.timestamp
      )
  )
}

export async function getSalesSummary({
  from,
  to,
} = {}) {
  const sales = await listSales({
    from,
    to,
  })

  const completedSales = sales.filter(
    (sale) => !sale.voided
  )

  const totalSales = completedSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  )

  const cashSales = completedSales
    .filter(
      (sale) =>
        sale.paymentMethod === 'cash'
    )
    .reduce(
      (sum, sale) => sum + sale.total,
      0
    )

  const mpesaSales = completedSales
    .filter(
      (sale) =>
        sale.paymentMethod === 'mpesa'
    )
    .reduce(
      (sum, sale) => sum + sale.total,
      0
    )

  const cardSales = completedSales
    .filter(
      (sale) =>
        sale.paymentMethod === 'card'
    )
    .reduce(
      (sum, sale) => sum + sale.total,
      0
    )

  const cancelledSales = sales.filter(
    (sale) => sale.voided
  )

  return {
    totalSales,
    salesCount: completedSales.length,
    cancelledCount: cancelledSales.length,
    cashSales,
    mpesaSales,
    cardSales,
  }
}

export async function listTodaysSales() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(
    endOfDay.getDate() + 1
  )

  return listSales({
    from: startOfDay.toISOString(),
    to: endOfDay.toISOString(),
  })
}