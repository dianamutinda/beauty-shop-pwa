import { useState } from 'react'
import { recordStockMovement } from '../../db/stock'
import { formatKsh } from '../../lib/format'

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400'

export default function SaleForm({ product }) {
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const qty = Number(quantity)
  const unitPrice = price === '' ? product.sellingPrice : Number(price)
  const total =
    Number.isInteger(qty) && qty > 0 && Number.isFinite(unitPrice) ? qty * unitPrice : null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Enter a whole number greater than zero.')
      return
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setError('Enter the price per unit as a number, 0 or more.')
      return
    }

    setSaving(true)
    try {
      const newStock = await recordStockMovement(product.id, 'sale', -qty, {
        note: 'Sold',
        unitPrice,
        listPrice: product.sellingPrice,
      })
      setMessage(`Sale recorded. Stock is now ${newStock}.`)
      setQuantity('1')
      setPrice('')
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700">Record a sale</h3>

      <input
        className={inputClass}
        type="number"
        inputMode="numeric"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Quantity"
      />

      <input
        className={inputClass}
        type="number"
        inputMode="numeric"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder={`Price per unit (list: ${product.sellingPrice})`}
      />

      {total !== null && (
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold text-pink-700">{formatKsh(total)}</span>
        </p>
      )}

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Record sale'}
      </button>
    </form>
  )
}