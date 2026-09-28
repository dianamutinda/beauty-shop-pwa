import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listSales } from '../../db/stock'
import { formatKsh } from '../../lib/format'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  }
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function SaleCard({ sale }) {
  const itemCount = sale.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div className="rounded-xl border border-pink-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {formatTime(sale.timestamp)}
            {' · '}
            {sale.paymentMethod
              ? sale.paymentMethod.toUpperCase()
              : 'Payment not recorded'}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {formatKsh(sale.total)}
          </p>

          {sale.voided && (
            <span className="text-xs font-medium text-red-500">
              Cancelled
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
        {sale.items.map((item) => (
          <div
            key={`${sale.saleId}-${item.productId}`}
            className="flex justify-between gap-3 text-xs text-gray-500"
          >
            <span>
              {item.quantity} × {item.name}
            </span>

            <span>
              {formatKsh(
                item.quantity * (item.unitPrice ?? 0)
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Sales() {
  const [filter, setFilter] = useState('all')

  const range = useMemo(
    () => getTodayRange(),
    []
  )

  const sales = useLiveQuery(
    () => listSales(range),
    [range]
  )

  const filteredSales = useMemo(() => {
    if (!sales) return []

    if (filter === 'completed') {
      return sales.filter((sale) => !sale.voided)
    }

    if (filter === 'cancelled') {
      return sales.filter((sale) => sale.voided)
    }

    return sales
  }, [sales, filter])

  const completedSales =
    sales?.filter((sale) => !sale.voided) ?? []

  const total = completedSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-pink-700">
          Sales
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Today's sales activity
        </p>
      </div>

      <div className="rounded-xl border border-pink-100 bg-white p-4">
        <p className="text-xs text-gray-500">
          Today's completed sales
        </p>

        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {formatKsh(total)}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {completedSales.length}{' '}
          {completedSales.length === 1
            ? 'sale'
            : 'sales'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={
              filter === item.value
                ? 'rounded-lg bg-pink-600 px-3 py-2 text-xs font-medium text-white'
                : 'rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs font-medium text-gray-600'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {!sales ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
          Loading sales...
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No sales found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            There are no {filter === 'all' ? '' : filter} sales today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <SaleCard
              key={sale.saleId}
              sale={sale}
            />
          ))}
        </div>
      )}

    </div>
  )
}