
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Package,
  AlertTriangle,
  Receipt,
  Boxes,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { getDashboardStats } from '../../db/dashboard'
import { formatKsh } from '../../lib/format'

function StatCard({
  label,
  value,
  note,
  to,
  icon: Icon,
  valueClass = 'text-gray-900',
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-semibold tracking-tight ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>
      </div>

      {note && (
        <p className="mt-2 text-xs text-gray-400">
          {note}
        </p>
      )}
    </>
  )

  const className =
    'block rounded-xl border border-pink-100 bg-white p-4 transition-colors hover:bg-pink-50/30'

  return to ? (
    <Link
      to={to}
      className={className}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>
      {content}
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

export default function Dashboard() {
  const stats = useLiveQuery(
    () => getDashboardStats(),
    []
  )

  if (!stats) {
    return (
      <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
        Loading dashboard...
      </div>
    )
  }

  const units =
    `${stats.unitsSoldToday} ` +
    `${stats.unitsSoldToday === 1 ? 'unit' : 'units'} sold`

  const discount =
    stats.discountToday > 0
      ? ` · ${formatKsh(stats.discountToday)} discounted`
      : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-pink-700">
          Overview
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          A quick look at how your shop is doing today.
        </p>
      </div>

      {/* Empty shop notice */}
      {stats.totalProducts === 0 && (
        <div className="rounded-xl border border-pink-100 bg-pink-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-pink-700">
              <Package
                size={18}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-pink-900">
                Your shop has no products yet.
              </p>

              <p className="mt-1 text-xs leading-5 text-pink-700">
                Add your first product to start managing
                stock and sales.
              </p>

              <Link
                to="/owner/products/new"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-pink-700"
              >
                Add the first product
                <ArrowRight
                  size={14}
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Shop Overview
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Products"
            value={stats.totalProducts}
            icon={Package}
            to="/owner/products"
          />

          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            note={
              stats.outOfStock > 0
                ? `${stats.outOfStock} out of stock`
                : 'Everything above warning level'
            }
            icon={AlertTriangle}
            valueClass={
              stats.lowStock > 0
                ? 'text-amber-600'
                : 'text-gray-900'
            }
            to="/owner/stock?filter=low"
          />

          <StatCard
            label="Sales Today"
            value={formatKsh(stats.salesToday)}
            note={`${units}${discount}`}
            icon={Receipt}
          />

          <StatCard
            label="Stock Value"
            value={formatKsh(stats.stockValue)}
            note="At selling price"
            icon={Boxes}
          />
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
                className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-pink-100 bg-white px-2 py-4 text-center transition-colors hover:bg-pink-50/30"
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

      {/* Inventory attention */}
      {stats.lowStock > 0 && (
        <Link
          to="/owner/stock?filter=low"
          className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4"
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
                {stats.lowStock}{' '}
                {stats.lowStock === 1
                  ? 'product needs'
                  : 'products need'}{' '}
                attention
              </p>

              <p className="mt-1 text-xs text-amber-700">
                Review low-stock products before they run out.
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
