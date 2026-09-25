import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listTodaysSales, voidSale } from '../../db/stock'
import { formatKsh } from '../../lib/format'

const PAYMENT_LABELS = { cash: 'Cash', mpesa: 'M-Pesa', card: 'Bank Card' }

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
    <div className="space-y-4">
      <button onClick={() => navigate('/')} className="text-sm text-pink-600">‹ Back</button>
      <h2 className="text-xl font-semibold text-gray-900">My Sales Today</h2>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {sales === undefined && <p className="text-sm text-gray-400">Loading...</p>}

      {sales?.length === 0 && (
        <p className="text-sm text-gray-400">No sales recorded yet today.</p>
      )}

      <ul className="space-y-3">
        {sales?.map((sale) => (
          <li
            key={sale.saleId}
            className={`rounded-xl border p-4 ${
              sale.voided ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-pink-100 bg-white'
            }`}
          >
            <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
              <span>{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{PAYMENT_LABELS[sale.paymentMethod] ?? 'Not tracked'}</span>
            </div>

            <ul className="divide-y divide-pink-50">
              {sale.items.map((item) => (
                <li key={item.productId} className="flex justify-between py-1 text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="text-gray-900">{formatKsh(item.quantity * item.unitPrice)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex items-center justify-between border-t border-pink-50 pt-2">
              <span className="text-sm font-semibold text-gray-900">{formatKsh(sale.total)}</span>
              {sale.voided ? (
                <span className="text-xs text-gray-400">Voided</span>
              ) : confirmingSaleId === sale.saleId ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVoid(sale.saleId)}
                    disabled={voidingSaleId === sale.saleId}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white disabled:opacity-60"
                  >
                    {voidingSaleId === sale.saleId ? 'Voiding...' : 'Confirm void'}
                  </button>
                  <button
                    onClick={() => setConfirmingSaleId(null)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingSaleId(sale.saleId)}
                  className="text-xs text-red-500"
                >
                  Void
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}