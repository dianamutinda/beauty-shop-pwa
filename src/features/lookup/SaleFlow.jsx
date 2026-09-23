import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchProducts } from '../../db/products'
import { recordSale } from '../../db/stock'
import { formatKsh } from '../../lib/format'
import { useBasket } from './useBasket'

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card', label: 'Bank Card' },
  { value: null, label: 'Not tracked' },
]

export default function SaleFlow() {
  const navigate = useNavigate()
  const basket = useBasket()

  const [step, setStep] = useState('basket')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(null) // { saleId, results }

  async function handleSearch(e) {
    const value = e.target.value
    setQuery(value)
    if (!value.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    const rows = await searchProducts(value)
    setResults(rows)
    setSearching(false)
  }

  function handleAdd(product) {
    basket.addItem(product)
    setQuery('')
    setResults([])
  }

  async function handleConfirm() {
    setError('')
    setSaving(true)
    try {
      const items = basket.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        listPrice: i.sellingPrice,
      }))
      const result = await recordSale(items, paymentMethod)
      setSaved(result)
      setStep('confirmation')
    } catch (err) {
      setError(err.message || 'Could not save the sale. Please try again.')
      setStep('basket')
    } finally {
      setSaving(false)
    }
  }

  function startNewSale() {
    basket.clear()
    setPaymentMethod('cash')
    setSaved(null)
    setStep('basket')
  }

  // ---- Basket step ----
  if (step === 'basket') {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="text-sm text-pink-600">‹ Back</button>
        <h2 className="text-xl font-semibold text-gray-900">New Sale</h2>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <input
          className={inputClass}
          value={query}
          onChange={handleSearch}
          placeholder="Search by name, SKU or category..."
        />

        {searching && <p className="text-sm text-gray-400">Searching...</p>}

        {results.length > 0 && (
          <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
            {results.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    SKU: {p.sku} · {formatKsh(p.sellingPrice)} ·{' '}
                    <span className={p.stock <= 0 ? 'text-red-500' : ''}>
                      {p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(p)}
                  disabled={p.stock <= 0}
                  className="rounded-xl bg-pink-600 px-3 py-2 text-xs text-white disabled:opacity-40"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}

        {basket.items.length > 0 && (
          <div className="space-y-2 rounded-xl border border-pink-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-700">Basket</h3>
            <ul className="divide-y divide-pink-100">
              {basket.items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{formatKsh(item.unitPrice)} each</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          item.quantity <= 1
                            ? basket.removeItem(item.productId)
                            : basket.updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="h-7 w-7 rounded-full border border-pink-200 text-pink-700"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (item.quantity >= item.stock) return
                          basket.updateQuantity(item.productId, item.quantity + 1)
                        }}
                        disabled={item.quantity >= item.stock}
                        className="h-7 w-7 rounded-full border border-pink-200 text-pink-700 disabled:opacity-40"
                      >
                        +
                      </button>
                      <p className="w-20 text-right text-sm font-semibold text-gray-900">
                        {formatKsh(item.quantity * item.unitPrice)}
                      </p>
                      <button
                        onClick={() => basket.removeItem(item.productId)}
                        className="text-gray-400"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-red-500">Max stock reached</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-between border-t border-pink-100 pt-3 text-sm">
              <span className="text-gray-500">Items ({basket.itemCount})</span>
              <span className="font-semibold text-gray-900">{formatKsh(basket.total)}</span>
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white"
            >
              Continue
            </button>
          </div>
        )}

        {basket.items.length === 0 && results.length === 0 && !query && (
          <p className="text-sm text-gray-400">Search for a product to start a sale.</p>
        )}
      </div>
    )
  }

  // ---- Payment method step ----
  if (step === 'payment') {
    return (
      <div className="space-y-4">
        <button onClick={() => setStep('basket')} className="text-sm text-pink-600">‹ Back</button>
        <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.label}
              onClick={() => setPaymentMethod(m.value)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                paymentMethod === m.value
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-pink-100 bg-white text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep('review')}
          className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white"
        >
          Continue
        </button>
      </div>
    )
  }

  // ---- Review step ----
  if (step === 'review') {
    return (
      <div className="space-y-4">
        <button onClick={() => setStep('payment')} className="text-sm text-pink-600">‹ Back</button>
        <h2 className="text-xl font-semibold text-gray-900">Review Sale</h2>

        <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
          {basket.items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatKsh(item.quantity * item.unitPrice)}
              </p>
            </li>
          ))}
        </ul>

        <div className="space-y-1 rounded-xl border border-pink-100 bg-white p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Items ({basket.itemCount})</span>
            <span className="text-gray-900">{formatKsh(basket.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment method</span>
            <span className="text-gray-900">
              {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
            </span>
          </div>
          <div className="flex justify-between border-t border-pink-100 pt-2 font-semibold">
            <span>Total</span>
            <span>{formatKsh(basket.total)}</span>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={saving}
          className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Confirm & Save'}
        </button>
      </div>
    )
  }

  // ---- Confirmation step ----
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Sale saved!</h2>

      <div className="rounded-xl border border-pink-100 bg-white p-4 text-sm">
        <p className="text-gray-500">Total</p>
        <p className="text-2xl font-bold text-pink-700">{formatKsh(basket.total)}</p>
        <p className="mt-2 text-gray-500">Payment method</p>
        <p className="text-gray-900">
          {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
        </p>
      </div>

      <button
        onClick={startNewSale}
        className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white"
      >
        Next sale
      </button>
      <button
        onClick={() => navigate('/')}
        className="w-full rounded-xl border border-pink-200 py-3 text-sm text-pink-700"
      >
        Back to Home
      </button>
    </div>
  )
}