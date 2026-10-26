import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Package,
  AlertTriangle,
  Receipt,
  Boxes,
  Plus,
  ArrowRight,
  Calendar,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { getDashboardStats } from '../../db/dashboard'
import { db } from '../../db'
import { formatKsh } from '../../lib/format'

const TIMEFRAMES = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: '7 days' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
  { id: 'custom', label: 'Custom' },
]

function StatCard({
  label,
  value,
  growthValue,
  to,
  icon: Icon,
  valueClass = 'text-gray-900',
}) {
  const isPositive = growthValue === undefined || growthValue >= 0

  return (
    <div className="block rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`mt-1 text-2xl font-semibold tracking-tight ${valueClass}`}>
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>

      {growthValue !== undefined && (
        <p className={`mt-2 text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>
            {growthValue === 100 
              ? 'New vs. previous period' 
              : `${Math.abs(growthValue)}% vs. previous period`}
          </span>
        </p>
      )}
    </div>
  )
}

const ACTIONS = [
  {
    to: '/owner/products/new',
    label: 'Add Product',
    icon: Plus,
  },
  {
    to: '/owner/stock',
    label: 'Update Stock',
    icon: Boxes,
  },
  {
    to: '/owner/count',
    label: 'Count Stock',
    icon: Package,
  },
]

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('today')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const stats = useLiveQuery(
    () => getDashboardStats(timeframe, { start: customStart, end: customEnd }),
    [timeframe, customStart, customEnd]
  )

  // Compute dynamic label for the date range banner
  const dateRangeLabel = useMemo(() => {
    const now = new Date()

    if (timeframe === 'today') {
      return formatDate(now)
    }

    if (timeframe === '7days') {
      const past = new Date()
      past.setDate(now.getDate() - 7)
      return `${formatDate(past)} – ${formatDate(now)}`
    }

    if (timeframe === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return `${formatDate(start)} – ${formatDate(end)}`
    }

    if (timeframe === 'year') {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      return `${formatDate(start)} – ${formatDate(end)}`
    }

    if (timeframe === 'custom') {
      if (customStart && customEnd) {
        return `${formatDate(customStart)} – ${formatDate(customEnd)}`
      }
      return 'Select date range below'
    }

    return ''
  }, [timeframe, customStart, customEnd])

  // Fetch recent sales movements for the feed
  const movements = useLiveQuery(
    () => db.stockMovements.where('type').equals('sale').reverse().limit(10).toArray(),
    []
  )

  const recentSales = useMemo(() => {
    if (!movements) return []
    const map = new Map()
    for (const m of movements) {
      if (!m.saleId || m.is_void || m.voided) continue
      if (!map.has(m.saleId)) {
        map.set(m.saleId, {
          saleId: m.saleId,
          timestamp: m.timestamp,
          paymentMethod: m.paymentMethod,
          total: 0,
          itemsCount: 0,
        })
      }
      const entry = map.get(m.saleId)
      entry.total += Math.abs(m.quantity) * (m.unitPrice || 0)
      entry.itemsCount += Math.abs(m.quantity)
    }
    
    // Convert to array and strictly sort descending (newest timestamp first)
    return Array.from(map.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 4)
  }, [movements])

  if (!stats) {
    return (
      <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-pink-700">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Here's how your shop is performing.
        </p>
      </div>

      {/* Timeframe Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TIMEFRAMES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTimeframe(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              timeframe === tab.id
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-pink-100 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Date Range Display Bar */}
      <div className="flex items-center justify-between rounded-xl border border-pink-100 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-pink-600" />
          <span className="font-medium text-gray-700">{dateRangeLabel}</span>
        </div>
        <ChevronRight size={15} className="text-gray-400" />
      </div>

      {/* Custom Date Inputs (Conditional) */}
      {timeframe === 'custom' && (
        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-pink-100 text-sm shadow-sm">
          <input 
            type="date" 
            value={customStart} 
            onChange={(e) => setCustomStart(e.target.value)} 
            className="border border-pink-100 rounded px-2 py-1 text-xs w-full outline-none"
          />
          <span className="text-gray-400">to</span>
          <input 
            type="date" 
            value={customEnd} 
            onChange={(e) => setCustomEnd(e.target.value)} 
            className="border border-pink-100 rounded px-2 py-1 text-xs w-full outline-none"
          />
        </div>
      )}

      {/* Empty shop notice */}
      {stats.totalProducts === 0 && (
        <div className="rounded-xl border border-pink-100 bg-pink-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-pink-700">
              <Package size={18} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-sm font-medium text-pink-900">
                Your shop has no products yet.
              </p>

              <p className="mt-1 text-xs leading-5 text-pink-700">
                Add your first product to start managing stock and sales.
              </p>

              <Link
                to="/owner/products/new"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-pink-700"
              >
                Add the first product
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Sales"
            value={formatKsh(stats.salesToday)}
            growthValue={stats.salesGrowth}
            icon={Receipt}
          />

          <StatCard
            label="Number of Sales"
            value={stats.numberOfSales}
            growthValue={stats.salesCountGrowth}
            icon={TrendingUp}
          />

          <StatCard
            label="Units Sold"
            value={stats.unitsSoldToday}
            growthValue={stats.unitsGrowth}
            icon={Package}
          />

          <StatCard
            label="Total Products"
            value={stats.totalProducts}
            icon={Boxes}
            to="/owner/products"
          />
        </div>
      </section>

      {/* Recent Sales Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Recent Sales
          </h3>
          <Link to="/owner/sales" className="text-xs font-medium text-pink-600 hover:underline">
            View all ›
          </Link>
        </div>

        <div className="rounded-xl border border-pink-100 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
          {recentSales.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No recent sales recorded yet.
            </div>
          ) : (
            recentSales.map((sale) => (
              <div key={sale.saleId} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-gray-900">{formatTime(sale.timestamp)}</p>
                  <p className="text-gray-400 mt-0.5">{sale.itemsCount} {sale.itemsCount === 1 ? 'item' : 'items'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-pink-50 text-pink-700 font-medium uppercase text-[10px]">
                    {sale.paymentMethod || 'Cash'}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">{formatKsh(sale.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Quick Actions
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-pink-100 bg-white px-2 py-4 text-center transition-colors hover:bg-pink-50/30 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                  />
                </div>

                <span className="text-xs font-medium text-gray-700">
                  {action.label}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Inventory attention / Low Stock Banner */}
      {stats.lowStock > 0 && (
        <Link
          to="/owner/stock?filter=low"
          className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600">
              <AlertTriangle
                size={18}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-amber-900">
                Low Stock Alert
              </p>

              <p className="mt-0.5 text-xs text-amber-700">
                {stats.lowStock} {stats.lowStock === 1 ? 'product needs' : 'products need'} attention.
              </p>
            </div>
          </div>

          <ArrowRight
            size={17}
            strokeWidth={1.8}
            className="shrink-0 text-amber-600"
          />
        </Link>
      )}
    </div>
  )
}