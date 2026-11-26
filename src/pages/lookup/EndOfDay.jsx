
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listTodaysSales } from '../../db/stock'
import { formatKsh } from '../../lib/format'

export default function EndOfDay() {
  const navigate = useNavigate()
  const sales = useLiveQuery(() => listTodaysSales(), [])

  const completedSales = sales?.filter((sale) => !sale.voided) ?? []

  const totalSales = completedSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  )

  const cashSales = completedSales
    .filter((sale) => sale.paymentMethod === 'cash')
    .reduce((sum, sale) => sum + sale.total, 0)

  const mpesaSales = completedSales
    .filter((sale) => sale.paymentMethod === 'mpesa')
    .reduce((sum, sale) => sum + sale.total, 0)

  const cardSales = completedSales
    .filter((sale) => sale.paymentMethod === 'card')
    .reduce((sum, sale) => sum + sale.total, 0)

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          End of Day
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review today's shop activity
        </p>
      </div>

      {/* Summary */}
      <section className="rounded-2xl border border-pink-100 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Today's summary
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-pink-50 p-4">
            <p className="text-xs text-gray-500">
              Total sales
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {sales === undefined ? '—' : formatKsh(totalSales)}
            </p>
          </div>

          <div className="rounded-xl bg-pink-50 p-4">
            <p className="text-xs text-gray-500">
              Sales count
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {sales === undefined ? '—' : completedSales.length}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              Cash
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {sales === undefined ? '—' : formatKsh(cashSales)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              M-Pesa
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {sales === undefined ? '—' : formatKsh(mpesaSales)}
            </p>
          </div>
        </div>
      </section>

      {/* Sales breakdown */}
      <section className="rounded-2xl border border-pink-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">
          Sales breakdown
        </h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Cash sales
            </span>

            <span className="text-sm font-medium text-gray-800">
              {sales === undefined ? '—' : formatKsh(cashSales)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              M-Pesa sales
            </span>

            <span className="text-sm font-medium text-gray-800">
              {sales === undefined ? '—' : formatKsh(mpesaSales)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Bank card sales
            </span>

            <span className="text-sm font-medium text-gray-800">
              {sales === undefined ? '—' : formatKsh(cardSales)}
            </span>
          </div>

          <div className="border-t border-pink-50 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Total
              </span>

              <span className="text-base font-semibold text-pink-700">
                {sales === undefined ? '—' : formatKsh(totalSales)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate('/sales')}
          className="w-full rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white"
        >
          View Today's Sales
        </button>

      </div>
    </div>
  )
}
