import { listProducts } from './products'
import { listSales } from './stock'

export async function getDashboardStats() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const from = startOfDay.toISOString()
  const to = endOfDay.toISOString()

  const [products, sales] = await Promise.all([
    listProducts(),
    listSales({ from, to }),
  ])

  const completedSales = sales.filter(
    (sale) => !sale.voided
  )

  const totalProducts = products.length

  const lowStockProducts = products.filter(
    (product) => product.stock <= product.lowStockAt
  )

  const lowStock = lowStockProducts.length

  const outOfStock = products.filter(
    (product) => product.stock === 0
  ).length

  const salesToday = completedSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  )

  const unitsSoldToday = completedSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce(
        (itemSum, item) => itemSum + item.quantity,
        0
      ),
    0
  )

  const discountToday = completedSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce(
        (itemSum, item) => {
          const listPrice = item.listPrice ?? item.unitPrice ?? 0
          const unitPrice = item.unitPrice ?? 0

          return itemSum + Math.max(0, listPrice - unitPrice) * item.quantity
        },
        0
      ),
    0
  )

  const stockValue = products.reduce(
    (sum, product) =>
      sum + product.stock * (product.sellingPrice ?? 0),
    0
  )

  return {
    totalProducts,
    lowStock,
    outOfStock,
    salesToday,
    unitsSoldToday,
    discountToday,
    stockValue,
  }
}