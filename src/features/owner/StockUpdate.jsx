import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getProductDetails } from '../../db/products'
import { listMovements, recordStockMovement } from '../../db/stock'
import { formatKsh, formatUpdated, stockStatus } from '../../lib/format'

const REASONS = {
  add: [
    { label: 'Restock', type: 'restock' },
    { label: 'Correction', type: 'adjustment' },
  ],
  remove: [
    { label: 'Sold', type: 'sale' },
    { label: 'Damaged or expired', type: 'adjustment' },
    { label: 'Lost or stolen', type: 'adjustment' },
    { label: 'Correction', type: 'adjustment' },
  ],
}

const TYPE_LABELS = {
  opening: 'Opening stock',
  restock: 'Restock',
  sale: 'Sale',
  adjustment: 'Adjustment',
}

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400'

export default function StockUpdate() {
  const { id } = useParams()
  const details = useLiveQuery(() => getProductDetails(id), [id])
  const movements = useLiveQuery(() => listMovements(id), [id]) ?? []

  const [mode, setMode] = useState('add')
  const [reasonIndex, setReasonIndex] = useState(0)
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  if (details === undefined) return null
  if (details === null) return <p className="text-sm text-gray-500">This product no longer exists.</p>

  const { product } = details
  const status = stockStatus(product.stock, product.lowStockAt)
  const isSale = mode === 'remove' && REASONS.remove[reasonIndex].type === 'sale'

  function switchMode(next) {
    setMode(next)
    setReasonIndex(0)
    setPrice('')
    setError('')
    setMessage('')
  }

  function changeReason(e) {
    setReasonIndex(Number(e.target.value))
    setPrice('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Enter a whole number greater than zero.')
      return
    }

    const reason = REASONS[mode][reasonIndex]
    const signed = mode === 'add' ? qty : -qty
    const fullNote = [reason.label, note.trim()].filter(Boolean).join(': ')

    let unitPrice = null
    let listPrice = null
    if (reason.type === 'sale') {
      listPrice = product.sellingPrice
      unitPrice = price === '' ? listPrice : Number(price)
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setError('Enter the price per unit as a number, 0 or more.')
        return
      }
    }

    setSaving(true)
    try {
      const newStock = await recordStockMovement(id, reason.type, signed, {
        note: fullNote,
        unitPrice,
        listPrice,
      })
      setMessage(`Saved. Stock is now ${newStock}.`)
      setQuantity('')
      setPrice('')
      setNote('')
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/owner/stock" className="text-sm text-pink-600">‹ Back to stock</Link>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
        <p className="text-sm text-gray-400">SKU: {product.sku}</p>
      </div>

      <div className="rounded-xl bg-pink-100 px-4 py-4">
        <p className="text-sm text-pink-800">Current stock</p>
        <p className="text-4xl font-bold text-pink-700">{product.stock}</p>
        <p className={`text-xs ${status.className}`}>{status.label}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          {['add', 'remove'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-xl py-2 text-sm ${
                mode === m ? 'bg-pink-600 text-white' : 'border border-pink-200 text-pink-700'
              }`}
            >
              {m === 'add' ? 'Add stock' : 'Remove stock'}
            </button>
          ))}
        </div>

        <select className={inputClass} value={reasonIndex} onChange={changeReason}>
          {REASONS[mode].map((r, i) => (
            <option key={r.label} value={i}>{r.label}</option>
          ))}
        </select>

        <input
          className={inputClass}
          type="number"
          inputMode="numeric"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />

        {isSale && (
          <input
            className={inputClass}
            type="number"
            inputMode="numeric"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={`Price per unit (list: ${product.sellingPrice})`}
          />
        )}

        <input
          className={inputClass}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note, optional"
        />

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">History</h3>
        {movements.length === 0 ? (
          <p className="text-sm text-gray-400">No movements yet.</p>
        ) : (
          <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-gray-900">{m.note || TYPE_LABELS[m.type] || m.type}</p>
                  <p className="text-xs text-gray-400">
                    {formatUpdated(m.timestamp)}
                    {m.type === 'sale' && m.unitPrice != null && (
                      <>
                        {' '}· @ {formatKsh(m.unitPrice)}
                        {m.listPrice != null && m.unitPrice < m.listPrice && ` (list ${m.listPrice})`}
                      </>
                    )}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.quantity > 0 ? '+' : ''}{m.quantity}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}