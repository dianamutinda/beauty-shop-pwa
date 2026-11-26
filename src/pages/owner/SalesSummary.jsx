import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  TrendingUp,
  Receipt,
  Banknote,
  CreditCard,
  Printer,
  ChevronRight,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { getDashboardStats } from '../../db/dashboard'
import { db } from '../../db'
import { formatKsh } from '../../lib/format'

const TIMEFRAMES = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
]

function SummaryCard({ label, value, growthValue, icon: Icon }) {
  const isPositive = growthValue === undefined || growthValue >= 0

  return (
    <div className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>

      {growthValue !== undefined && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs font-medium ${
            isPositive ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
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

export default function SalesSummary() {
  const [timeframe, setTimeframe] = useState('today')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // Fetch overall stats for comparison
  const stats = useLiveQuery(
    () => getDashboardStats(timeframe, { start: customStart, end: customEnd }),
    [timeframe, customStart, customEnd]
  )

  // Fetch stock movements for breakdown calculations
  const movements = useLiveQuery(
    () => db.stockMovements.where('type').equals('sale').toArray(),
    []
  )

  // Calculate payment method breakdowns
  const paymentBreakdown = useMemo(() => {
    if (!movements) return { cash: 0, mpesa: 0, card: 0, total: 0 }

    let cash = 0
    let mpesa = 0
    let card = 0

    for (const m of movements) {
      if (m.is_void || m.voided) continue
      const amount = Math.abs(m.quantity) * (m.unitPrice || 0)
      const method = (m.paymentMethod || 'cash').toLowerCase()

      if (method.includes('mpesa') || method.includes('m-pesa')) {
        mpesa += amount
      } else if (method.includes('card')) {
        card += amount
      } else {
        cash += amount
      }
    }

    const total = cash + mpesa + card
    return { cash, mpesa, card, total }
  }, [movements])

  const calcPercentage = (amount) => {
    if (!paymentBreakdown.total || paymentBreakdown.total === 0) return 0
    return Math.round((amount / paymentBreakdown.total) * 100)
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
        Loading sales summary...
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-pink-700">Sales Summary</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review sales performance and payment channel breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700">
          <Sparkles size={14} />
          <span>Synced</span>
        </div>
      </div>

      {/* Timeframe Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TIMEFRAMES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTimeframe(tab.id)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              timeframe === tab.id
                ? 'bg-pink-600 text-white shadow-sm'
                : 'border border-pink-100 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Primary KPI Grid */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label="Total Sales"
            value={formatKsh(stats.salesToday)}
            growthValue={stats.salesGrowth}
            icon={Receipt}
          />

          <SummaryCard
            label="Total Transactions"
            value={stats.numberOfSales}
            growthValue={stats.salesCountGrowth}
            icon={TrendingUp}
          />

          <SummaryCard
            label="Cash Collected"
            value={formatKsh(paymentBreakdown.cash)}
            icon={Banknote}
          />

          <SummaryCard
            label="M-Pesa / Card"
            value={formatKsh(paymentBreakdown.mpesa + paymentBreakdown.card)}
            icon={CreditCard}
          />
        </div>
      </section>

      {/* Payment Channel Breakdown */}
      <section className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Payment Breakdown</h3>
            <p className="text-xs text-gray-400">Distribution by payment method</p>
          </div>
          <Link
            to="/owner/sales"
            className="text-xs font-medium text-pink-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Cash */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Banknote size={14} className="text-emerald-600" />
              <span>Cash</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatKsh(paymentBreakdown.cash)}
            </p>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${calcPercentage(paymentBreakdown.cash)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400">{calcPercentage(paymentBreakdown.cash)}%</p>
          </div>

          {/* M-Pesa */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CreditCard size={14} className="text-pink-600" />
              <span>M-Pesa</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatKsh(paymentBreakdown.mpesa)}
            </p>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-pink-500 transition-all"
                style={{ width: `${calcPercentage(paymentBreakdown.mpesa)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400">{calcPercentage(paymentBreakdown.mpesa)}%</p>
          </div>

          {/* Card */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CreditCard size={14} className="text-purple-600" />
              <span>Card</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatKsh(paymentBreakdown.card)}
            </p>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${calcPercentage(paymentBreakdown.card)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400">{calcPercentage(paymentBreakdown.card)}%</p>
          </div>
        </div>
      </section>

      {/* Action Button: Print / Export */}
      <button
        type="button"
        onClick={() => window.print()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 active:scale-[0.99]"
      >
        <Printer size={18} />
        <span>Print / Export Summary Report</span>
      </button>
    </div>
  )
}