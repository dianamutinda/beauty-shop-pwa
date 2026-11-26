
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listTodaysSales, voidSale } from '../../db/stock'
import { formatKsh } from '../../lib/format'

const PAYMENT_LABELS = {
  cash: 'Cash',
  mpesa: 'M-Pesa',
  card: 'Bank Card',
}

export default function SalesToday() {
  const navigate = useNavigate()
  const sales = useLiveQuery(() => listTodaysSales(), [])

  const [confirmingSaleId, setConfirmingSaleId] = useState(null)
  const [voidingSaleId, setVoidingSaleId] = useState(null)
  const [error, setError] = useState('')

  async function handleVoid(saleId) {
    setVoidingSaleId(saleId)
    setError('')

    try {
      await voidSale(saleId)
      setConfirmingSaleId(null)
    } catch (err) {
      setError(err.message || 'Could not void this sale. Please try again.')
    } finally {
      setVoidingSaleId(null)
    }
  }

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          My Sales Today
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Sales recorded today
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {sales === undefined && (
        <p className="text-sm text-gray-400">
          Loading...
        </p>
      )}

      {sales?.length === 0 && (
        <div className="rounded-2xl border border-pink-100 bg-white px-5 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">
            No sales recorded yet today.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Completed sales will appear here.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {sales?.map((sale) => (
          <li
            key={sale.saleId}
            className={`rounded-2xl border p-4 ${
              sale.voided
                ? 'border-gray-100 bg-gray-50'
                : 'border-pink-100 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(sale.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  {sale.items.length}{' '}
                  {sale.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-1.5">
                <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-medium text-pink-700">
                  {PAYMENT_LABELS[sale.paymentMethod] ?? 'Not tracked'}
                </span>

                {sale.voided && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                    Cancelled
                  </span>
                )}
              </div>
            </div>

            <ul className="mt-3 divide-y divide-pink-50">
              {sale.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span
                    className={`${
                      sale.voided
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.name} × {item.quantity}
                  </span>

                  <span
                    className={
                      sale.voided
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900'
                    }
                  >
                    {formatKsh(item.quantity * item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex items-center justify-between border-t border-pink-50 pt-3">
              <div>
                <p className="text-xs text-gray-400">
                  Total
                </p>

                <p
                  className={`mt-0.5 text-base font-semibold ${
                    sale.voided
                      ? 'text-gray-400 line-through'
                      : 'text-gray-900'
                  }`}
                >
                  {formatKsh(sale.total)}
                </p>
              </div>

              {!sale.voided && (
                <>
                  {confirmingSaleId === sale.saleId ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleVoid(sale.saleId)}
                        disabled={voidingSaleId === sale.saleId}
                        className="rounded-xl bg-red-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
                      >
                        {voidingSaleId === sale.saleId
                          ? 'Cancelling...'
                          : 'Cancel sale'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmingSaleId(null)}
                        disabled={voidingSaleId === sale.saleId}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 disabled:opacity-60"
                      >
                        Keep sale
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingSaleId(sale.saleId)}
                      className="text-xs font-medium text-red-500"
                    >
                      Cancel sale
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

