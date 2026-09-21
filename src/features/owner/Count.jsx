import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listProducts, searchProducts } from '../../db/products'
import { applyStockCount } from '../../db/stock'

// null = nothing entered, NaN = entered but invalid, otherwise the number
function parseCount(value) {
  if (value === undefined || value === '') return null
  const n = Number(value)
  return Number.isInteger(n) && n >= 0 ? n : NaN
}

export default function Count() {
  const [text, setText] = useState('')
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const all = useLiveQuery(() => listProducts(), []) ?? []
  const visible = useLiveQuery(() => searchProducts(text), [text]) ?? []

  const entered = all
    .map((product) => ({ product, counted: parseCount(counts[product.id]) }))
    .filter((e) => e.counted !== null)

  const hasInvalid = entered.some((e) => Number.isNaN(e.counted))
  const changes = entered.filter(
    (e) => !Number.isNaN(e.counted) && e.counted !== e.product.stock
  )
  const net = changes.reduce((sum, e) => sum + (e.counted - e.product.stock), 0)

  function setCount(id, value) {
    setCounts((c) => ({ ...c, [id]: value }))
    setMessage('')
  }

  async function handleApply() {
    const word = changes.length === 1 ? 'product' : 'products'
    if (!window.confirm(`Adjust stock for ${changes.length} ${word} to match your count?`)) return

    setSaving(true)
    setError('')
    try {
      const adjusted = await applyStockCount(
        changes.map((e) => ({ productId: e.product.id, counted: e.counted }))
      )
      setCounts({})
      setMessage(`Done. ${adjusted} ${adjusted === 1 ? 'product' : 'products'} adjusted.`)
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
        <h2 className="text-xl font-semibold text-pink-700">Stock Count</h2>
        <p className="text-sm text-gray-500">
          Enter what you actually count on the shelf. Nothing changes until you tap Apply.
        </p>
      </div>

      <div className="sticky top-0 z-10 space-y-2 rounded-xl border border-pink-100 bg-white p-3 text-sm">
        <p className="text-gray-600">
          {entered.length} counted · {changes.length} differ · net {net > 0 ? '+' : ''}{net} units
        </p>
        {hasInvalid && <p className="text-red-600">Counts must be whole numbers, 0 or more.</p>}
        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-700">{message}</p>}
        <button
          onClick={handleApply}
          disabled={saving || hasInvalid || changes.length === 0}
          className="w-full rounded-xl bg-pink-600 py-2 text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : `Apply count (${changes.length})`}
        </button>
      </div>

      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
      />

      {all.length === 0 && <p className="text-sm text-gray-400">No products to count yet.</p>}

      {visible.length > 0 && (
        <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
          {visible.map((p) => {
            const counted = parseCount(counts[p.id])
            const invalid = Number.isNaN(counted)
            const diff = counted !== null && !invalid ? counted - p.stock : null

            return (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">System: {p.stock}</p>
                  {diff !== null && (
                    <p className={`text-xs font-semibold ${diff === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                      {diff === 0 ? '✓ matches' : `${diff > 0 ? '+' : ''}${diff}`}
                    </p>
                  )}
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={counts[p.id] ?? ''}
                  onChange={(e) => setCount(p.id, e.target.value)}
                  placeholder="Count"
                  className={`w-20 rounded-lg border px-2 py-2 text-center text-sm outline-none ${
                    invalid ? 'border-red-400' : 'border-pink-200 focus:border-pink-400'
                  }`}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}