
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Package,
  AlertTriangle,
  Receipt,
  Boxes,
  ArrowUpRight,
  Calendar,
  Wallet,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  ArrowRight,
  Users,
  CreditCard,
} from 'lucide-react'

import { getDashboardStats } from '../../db/dashboard'
import { db } from '../../db'
import { formatKsh } from '../../lib/format'

import Card from '../../features/sales/components/ui/Card'
import StatCard from '../../features/sales/components/ui/StatCard'
import Tabs from '../../features/sales/components/ui/Tabs'
import PageContainer from '../../features/sales/components/layout/PageContainer'
import PageHeader from '../../features/sales/components/layout/PageHeader'
import NotificationBell from '../../features/sales/components/ui/NotificationBell'
    
const TIMEFRAMES = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7 days' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
]

const ACTIONS = [
  {
    to: '/owner/sales/new',
    label: 'New Sale',
    icon: ShoppingCart,
  },
  {
    to: '/owner/stock',
    label: 'Manage Stock',
    icon: Boxes,
  },
  {
    to: '/owner/reports',
    label: 'View Reports',
    icon: BarChart3,
  },
  {
    to: '/owner/products/new',
    label: 'Add Products',
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
    month: 'long',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('today')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const stats = useLiveQuery(
    () => getDashboardStats(timeframe, {
      start: customStart,
      end: customEnd,
    }),
    [timeframe, customStart, customEnd]
  )

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

      return 'Select a date range'
    }

    return ''
  }, [timeframe, customStart, customEnd])

  const movements = useLiveQuery(
    () => db.stockMovements
      .where('type')
      .equals('sale')
      .reverse()
      .limit(10)
      .toArray(),
    []
  )

  const recentSales = useMemo(() => {
    if (!movements) return []

    const map = new Map()

    for (const movement of movements) {
      if (!movement.saleId || movement.is_void || movement.voided) continue

      if (!map.has(movement.saleId)) {
        map.set(movement.saleId, {
          saleId: movement.saleId,
          timestamp: movement.timestamp,
          paymentMethod: movement.paymentMethod,
          total: 0,
          itemsCount: 0,
        })
      }

      const sale = map.get(movement.saleId)

      sale.total += Math.abs(movement.quantity) * (movement.unitPrice || 0)
      sale.itemsCount += Math.abs(movement.quantity)
    }

    return Array.from(map.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 4)
  }, [movements])

  if (!stats) {
    return (
      <PageContainer>
        <Card padding="lg">
          <p className="text-sm text-text-secondary text-center">
            Loading dashboard...
          </p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6 pb-8">

      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description={formatDate(new Date())}
        actions={
          <NotificationBell notifications={[]} />
        }
      />

      {/* Sales Overview */}
      <Link
        to="/owner/sales"
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
      >
        <Card
          padding="md"
          className="!overflow-hidden !border-transparent !bg-[#2E5B3D] !text-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/75">
                Today's Sales
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {formatKsh(stats.salesToday)}
              </h2>

              {stats.salesGrowth !== undefined && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-white/85">
                  <TrendingUp size={14} />

                  <span>
                    {Math.abs(stats.salesGrowth)}% vs yesterday
                  </span>
                </div>
              )}
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Receipt size={21} className="text-white" />
            </div>
          </div>

          <div className="mt-5 flex h-12 items-end justify-end gap-1.5 opacity-70">
            {[18, 25, 21, 34, 29, 40, 35, 48, 42, 56].map((height, index) => (
              <div
                key={index}
                className="w-2 rounded-t-sm bg-white/70"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </Card>
      </Link>

      {/* Business Overview */}
      <section className="space-y-3">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text-primary">
            Business Overview
          </h3>

          <Tabs
            tabs={TIMEFRAMES}
            value={timeframe}
            onChange={setTimeframe}
            variant="pills"
            size="sm"
            showContent={false}
          />
        </div>

        {timeframe === 'custom' && (
          <Card padding="sm" variant="outlined">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="mb-1 block text-xs text-text-secondary">
                  Start date
                </label>

                <input
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-border bg-surface px-2 py-2 text-xs text-text-primary outline-none focus:border-interactive-primary"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-xs text-text-secondary">
                  End date
                </label>

                <input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-border bg-surface px-2 py-2 text-xs text-text-primary outline-none focus:border-interactive-primary"
                />
              </div>
            </div>
          </Card>
        )}

        <p className="flex items-center gap-2 text-xs text-text-muted">
          <Calendar size={13} />
          {dateRangeLabel}
        </p>

        <div className="grid grid-cols-2 gap-3">

          {/* Stock Value */}
          <Link
            to="/owner/stock"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
          >
            <StatCard
              title="Stock Value"
              value={formatKsh(stats.stockValue)}
              icon={<Wallet size={18} />}
            />
          </Link>

          {/* Total Products */}
          <Link
            to="/owner/products"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
          >
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<Boxes size={18} />}
            />
          </Link>

          {/* Products Sold */}
          <Link
            to="/owner/sales"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
          >
            <StatCard
              title="Products Sold"
              value={stats.unitsSoldToday}
              icon={<Package size={18} />}
              trend={
                stats.unitsGrowth !== undefined
                  ? `${Math.abs(stats.unitsGrowth)}% vs previous`
                  : undefined
              }
              trendVariant={
                (stats.unitsGrowth ?? 0) >= 0 ? 'success' : 'danger'
              }
            />
          </Link>

          {/* Low Stock */}
          <Link
            to="/owner/stock?filter=low"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
          >
            <StatCard
              title="Low Stock"
              value={stats.lowStock}
              icon={<AlertTriangle size={18} />}
              trend={stats.lowStock > 0 ? 'Needs attention' : 'All stocked'}
              trendVariant={stats.lowStock > 0 ? 'warning' : 'success'}
            />
          </Link>

        </div>
      </section>

      {/* Sales Performance */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Sales Performance
          </h3>

          <p className="mt-1 text-xs text-text-secondary">
            Sales over selected period
          </p>
        </div>

        <Card padding="md">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-soft text-interactive-primary">
              <TrendingUp size={20} />
            </div>

            <p className="mt-3 text-sm font-medium text-text-secondary">
              Sales chart
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Chart visualization coming soon
            </p>
          </div>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-text-primary">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.to}
                to={action.to}
                className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-3 transition-colors hover:bg-interactive-soft"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-interactive-soft text-interactive-primary">
                    <Icon size={16} />
                  </div>

                  <span className="truncate text-xs font-medium text-text-primary">
                    {action.label}
                  </span>
                </div>

                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-text-muted transition-colors group-hover:text-interactive-primary"
                />
              </Link>
            )
          })}
        </div>
      </section>

      {/* Customer Credit */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Customer Credit
          </h3>

          <p className="mt-1 text-xs text-text-secondary">
            Manage customers who purchase on credit and track outstanding balances.
          </p>
        </div>

        <Link
          to="/owner/customers"
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
        >
          <Card
            padding="md"
            className="transition-colors hover:bg-background"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-interactive-soft text-interactive-primary">
                  <CreditCard size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    Credit Accounts
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    View customer balances and repayments
                  </p>
                </div>
              </div>

              <ArrowRight
                size={17}
                className="shrink-0 text-text-muted"
              />
            </div>
          </Card>
        </Link>
      </section>

      {/* Recent Activities */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text-primary">
            Recent Activities
          </h3>

          <Link
            to="/owner/sales"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-interactive-primary"
          >
            View All
            <ArrowRight size={13} />
          </Link>
        </div>

        <Card padding="none">
          {recentSales.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-interactive-soft text-interactive-primary">
                <ShoppingCart size={18} />
              </div>

              <p className="mt-3 text-sm font-medium text-text-secondary">
                No recent activities
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Completed sales will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-divider">
              {recentSales.map((sale) => (
                <div
                  key={sale.saleId}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-interactive-soft text-interactive-primary">
                      <ShoppingCart size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-text-primary">
                        Sale Completed
                      </p>

                      <p className="mt-1 text-[11px] text-text-secondary">
                        {sale.itemsCount} {sale.itemsCount === 1 ? 'item' : 'items'}
                        {' · '}
                        {sale.paymentMethod || 'Cash'}
                      </p>

                      <p className="mt-1 text-[10px] text-text-muted">
                        {formatTime(sale.timestamp)}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-xs font-semibold text-text-primary">
                    {formatKsh(sale.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && (
        <Link
          to="/owner/stock?filter=low"
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
        >
          <Card
            padding="md"
            className="border-warning/30 bg-warning/5 transition-colors hover:bg-warning/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <AlertTriangle size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    Low Stock Alert
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    {stats.lowStock} {stats.lowStock === 1 ? 'product needs' : 'products need'} attention.
                  </p>
                </div>
              </div>

              <ArrowRight size={17} className="shrink-0 text-warning" />
            </div>
          </Card>
        </Link>
      )}

      {/* Empty Shop Notice */}
      {stats.totalProducts === 0 && (
        <Card padding="md" variant="outlined">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-interactive-soft text-interactive-primary">
              <Package size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                Your shop has no products yet.
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                Add your first product to start managing stock and sales.
              </p>

              <Link
                to="/owner/products/new"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-interactive-primary"
              >
                Add your first product
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Card>
      )}

    </PageContainer>
  )
}
