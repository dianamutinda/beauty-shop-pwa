import { db } from './index'
import { getShopId } from './shop'
import { listProducts } from './products'

export async function getDashboardStats() {
  const shopId = await getShopId()
  const products = await listProducts()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const todaysSales = await db.stockMovements
    .where('timestamp')
    .aboveOrEqual(startOfToday.toISOString())
    .filter((m) => m.shopId === shopId && m.type === 'sale')
    .toArray()

  // Sale quantities are negative, so flip the sign
  const unitsSoldToday = todaysSales.reduce((sum, m) => sum - m.quantity, 0)

  // What customers actually paid
  const salesToday = todaysSales.reduce(
    (sum, m) => (m.unitPrice == null ? sum : sum - m.quantity * m.unitPrice),
    0
  )

  // How much was given away against list prices (haggling, discounts)
  const discountToday = todaysSales.reduce(
    (sum, m) =>
      m.unitPrice == null || m.listPrice == null
        ? sum
        : sum - m.quantity * (m.listPrice - m.unitPrice),
    0
  )

  return {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stock <= p.lowStockAt).length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
    stockValue: products.reduce((sum, p) => sum + Math.max(p.stock, 0) * p.sellingPrice, 0),
    unitsSoldToday,
    salesToday,
    discountToday,
  }
}