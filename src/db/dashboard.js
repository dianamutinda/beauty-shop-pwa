import { listProducts } from './products'
import { listSales } from './stock'

export async function getDashboardStats(timeframe = 'today', customRange = null) {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)

  let prevStart = new Date(now)
  let prevEnd = new Date(now)

  if (timeframe === 'today') {
    start.setHours(0, 0, 0, 0)
    end.setDate(start.getDate() + 1)
    end.setHours(0, 0, 0, 0)

    prevStart = new Date(start)
    prevStart.setDate(prevStart.getDate() - 1)
    prevEnd = new Date(start)
  } else if (timeframe === '7days') {
    start.setDate(now.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    prevStart = new Date(start)
    prevStart.setDate(prevStart.getDate() - 7)
    prevEnd = new Date(start)
  } else if (timeframe === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    start.setHours(0, 0, 0, 0)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)

    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
  } else if (timeframe === 'year') {
    start = new Date(now.getFullYear(), 0, 1)
    start.setHours(0, 0, 0, 0)
    end = new Date(now.getFullYear(), 11, 31)
    end.setHours(23, 59, 59, 999)

    prevStart = new Date(now.getFullYear() - 1, 0, 1)
    prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
  } else if (timeframe === 'custom' && customRange?.start && customRange?.end) {
    start = new Date(customRange.start)
    start.setHours(0, 0, 0, 0)
    end = new Date(customRange.end)
    end.setHours(23, 59, 59, 999)

    const diffTime = Math.abs(end - start)
    prevEnd = new Date(start)
    prevStart = new Date(prevEnd.getTime() - diffTime)
  }

  const [products, sales, prevSales] = await Promise.all([
    listProducts(),
    listSales({ from: start.toISOString(), to: end.toISOString() }),
    listSales({ from: prevStart.toISOString(), to: prevEnd.toISOString() }),
  ])

  const completedSales = sales.filter((sale) => !sale.voided)
  const completedPrevSales = prevSales.filter((sale) => !sale.voided)

  const totalProducts = products.length
  const lowStock = products.filter((p) => p.stock <= p.lowStockAt).length
  const outOfStock = products.filter((p) => p.stock === 0).length

  const salesTotal = completedSales.reduce((sum, s) => sum + s.total, 0)
  const unitsSold = completedSales.reduce(
    (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
    0
  )
  const numberOfSales = completedSales.length

  const prevSalesTotal = completedPrevSales.reduce((sum, s) => sum + s.total, 0)
  const prevUnitsSold = completedPrevSales.reduce(
    (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
    0
  )
  const prevNumberOfSales = completedPrevSales.length

  // Clean growth calculation that avoids ridiculous multipliers when baseline is 0
 // Clean growth calculation that handles zero-baselines gracefully
  function calcGrowth(current, previous) {
    if (previous === 0) {
      // If there were no sales in the previous period, show +100% if we made sales now, or 0% if still 0
      return current > 0 ? 100 : 0
    }
    
    // Real standard growth formula
    const val = Math.round(((current - previous) / previous) * 100)
    
    // Cap at a reasonable percentage range (-100% to +100% for brand new baseline comparisons)
    return Math.max(-100, val)
  }

  const salesGrowth = calcGrowth(salesTotal, prevSalesTotal)
  const salesCountGrowth = calcGrowth(numberOfSales, prevNumberOfSales)
  const unitsGrowth = calcGrowth(unitsSold, prevUnitsSold)

  const stockValue = products.reduce(
    (sum, product) => sum + product.stock * (product.sellingPrice ?? 0),
    0
  )

  return {
    totalProducts,
    lowStock,
    outOfStock,
    salesToday: salesTotal,
    unitsSoldToday: unitsSold,
    numberOfSales,
    salesGrowth,
    salesCountGrowth,
    unitsGrowth,
    stockValue,
  }
}