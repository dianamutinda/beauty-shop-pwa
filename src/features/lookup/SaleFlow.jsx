
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchProducts } from '../../db/products'
import { recordSale, voidSale } from '../../db/stock'
import { formatKsh } from '../../lib/format'
import { useBasketContext } from './BasketContext'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card', label: 'Bank Card' },
  { value: null, label: 'Not tracked' },
]

export default function SaleFlow() {
  const navigate = useNavigate()
  const basket = useBasketContext()

  const [step, setStep] = useState('basket')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [saved, setSaved] = useState(null)

  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0)
  const [showUndoModal, setShowUndoModal] = useState(false)
  const [voiding, setVoiding] = useState(false)
  const [voided, setVoided] = useState(false)

  async function handleSearch(e) {
    const value = e.target.value

    setQuery(value)
    setError('')

    if (!value.trim()) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)

    try {
      const found = await searchProducts(value)
      setResults(found ?? [])
    } catch (err) {
      console.error(err)
      setResults([])
      setError('Could not search products.')
    } finally {
      setSearching(false)
    }
  }

  function handleAdd(product) {
    basket.addItem(product)
    setQuery('')
    setResults([])
    setError('')
  }

  async function handleConfirm() {
    if (basket.items.length === 0) {
      setError('Add at least one product before saving the sale.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const items = basket.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        listPrice: item.sellingPrice,
      }))

      // Calculate the total before clearing the basket.
      const total = basket.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      )

      const result = await recordSale(items, paymentMethod)

      // The sale is now saved, so there is no longer
      // an active/current basket.
      basket.clear()

      setSaved({
        ...result,
        total,
      })

      setVoided(false)
      setUndoSecondsLeft(15)
      setStep('confirmation')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save the sale.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUndo() {
    if (!saved?.saleId || voided) return

    // Do not allow cancellation after the 15-second window.
    if (undoSecondsLeft <= 0) {
      setShowUndoModal(false)
      return
    }

    setVoiding(true)
    setError('')

    try {
      await voidSale(saved.saleId)

      setVoided(true)
      setShowUndoModal(false)
      setUndoSecondsLeft(0)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not cancel the sale.')
    } finally {
      setVoiding(false)
    }
  }

  useEffect(() => {
    if (step !== 'confirmation' || !saved || voided) {
      return
    }

    const timer = setInterval(() => {
      setUndoSecondsLeft((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer)

          // If the dialog is still open when time runs out,
          // close it because the cancellation window has expired.
          setShowUndoModal(false)

          return 0
        }

        return seconds - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step, saved, voided])

  function startNewSale() {
    basket.clear()

    setQuery('')
    setResults([])
    setPaymentMethod(null)

    setSaved(null)
    setUndoSecondsLeft(0)
    setShowUndoModal(false)
    setVoided(false)

    setError('')
    setStep('basket')
  }

  if (step === 'basket') {
    return (
      <div className="space-y-5">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 text-sm text-pink-600"
          >
            ‹ Back
          </button>

          <h2 className="text-2xl font-semibold text-gray-900">
            New Sale
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add the products the customer is buying.
          </p>
        </div>

        <div>
          <input
            type="search"
            className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 focus:border-pink-400"
            value={query}
            onChange={handleSearch}
            placeholder="Search products, SKU or category..."
          />

          {searching && (
            <p className="mt-2 text-xs text-gray-400">
              Searching...
            </p>
          )}
        </div>

        {results.length > 0 && (
          <ul className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
            {results.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 border-b border-pink-100 px-4 py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    SKU: {product.sku}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-pink-700">
                    {formatKsh(product.sellingPrice)}
                  </p>

                  <p
                    className={`mt-0.5 text-xs ${
                      product.stock <= 0
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {product.stock <= 0
                      ? 'Out of stock'
                      : `${product.stock} in stock`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  disabled={product.stock <= 0}
                  className="shrink-0 rounded-xl bg-pink-600 px-3.5 py-2 text-xs font-medium text-white disabled:opacity-40"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}

        {basket.items.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Basket
              </h3>

              <span className="text-xs text-gray-400">
                {basket.itemCount}{' '}
                {basket.itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
              <ul className="divide-y divide-pink-100">
                {basket.items.map((item) => (
                  <li
                    key={item.productId}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatKsh(item.unitPrice)} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          basket.removeItem(item.productId)
                        }
                        className="shrink-0 text-lg leading-none text-gray-300"
                        aria-label={`Remove ${item.name}`}
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity <= 1
                              ? basket.removeItem(item.productId)
                              : basket.updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200 text-pink-700"
                        >
                          −
                        </button>

                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity >= item.stock) return

                            basket.updateQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }}
                          disabled={item.quantity >= item.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200 text-pink-700 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        {formatKsh(
                          item.quantity * item.unitPrice
                        )}
                      </p>
                    </div>

                    {item.quantity >= item.stock && (
                      <p className="mt-2 text-xs text-red-500">
                        Maximum stock reached
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              <div className="border-t border-pink-100 bg-pink-50/50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Total
                  </span>

                  <span className="text-lg font-semibold text-pink-700">
                    {formatKsh(basket.total)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('payment')}
              className="w-full rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white"
            >
              Continue
            </button>
          </section>
        ) : (
          !query && (
            <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">
                Your basket is empty
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Search for a product above to add it to this sale.
              </p>
            </div>
          )
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="space-y-5">
        <div>
          <button
            type="button"
            onClick={() => setStep('basket')}
            className="mb-3 text-sm text-pink-600"
          >
            ‹ Back to basket
          </button>

          <h2 className="text-2xl font-semibold text-gray-900">
            Payment
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            How did the customer pay?
          </p>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {basket.itemCount}{' '}
              {basket.itemCount === 1 ? 'item' : 'items'}
            </span>

            <span className="text-lg font-semibold text-gray-900">
              {formatKsh(basket.total)}
            </span>
          </div>
        </div>

        <section className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Payment method
          </p>

          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method.value

              return (
                <button
                  key={method.label}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-pink-100 bg-white'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      selected
                        ? 'text-pink-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {method.label}
                  </span>

                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      selected
                        ? 'border-pink-600 bg-pink-600'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={() => setStep('review')}
          className="w-full rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white"
        >
          Continue
        </button>
      </div>
    )
  }

  if (step === 'review') {
    return (
      <div className="space-y-5">
        <div>
          <button
            type="button"
            onClick={() => setStep('payment')}
            className="mb-3 text-sm text-pink-600"
          >
            ‹ Back to payment
          </button>

          <h2 className="text-2xl font-semibold text-gray-900">
            Review Sale
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Check the sale before saving it.
          </p>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Items
            </h3>

            <span className="text-xs text-gray-400">
              {basket.itemCount}{' '}
              {basket.itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
            <ul className="divide-y divide-pink-100">
              {basket.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {item.quantity} × {formatKsh(item.unitPrice)}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-gray-900">
                    {formatKsh(item.quantity * item.unitPrice)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="rounded-2xl border border-pink-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Payment method
            </span>

            <span className="text-sm font-medium text-gray-900">
              {PAYMENT_METHODS.find(
                (method) => method.value === paymentMethod
              )?.label ?? 'Not tracked'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-pink-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Total
            </span>

            <span className="text-xl font-semibold text-pink-700">
              {formatKsh(basket.total)}
            </span>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="w-full rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving sale...' : 'Save Sale'}
        </button>
      </div>
    )
  }

  if (step === 'confirmation') {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-pink-100 bg-white px-5 py-8 text-center">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl ${
              voided
                ? 'bg-amber-50 text-amber-600'
                : 'bg-pink-50 text-pink-600'
            }`}
          >
            {voided ? '✓' : '✓'}
          </div>

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {voided ? 'Sale cancelled' : 'Sale saved'}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {voided
              ? 'The sale was cancelled and the stock was restored.'
              : 'The sale has been recorded successfully.'}
          </p>

          {saved && (
            <div className="mt-5 rounded-xl bg-pink-50 px-4 py-3">
              <p className="text-xs text-gray-500">
                Total
              </p>

              <p className="mt-1 text-lg font-semibold text-pink-700">
                {formatKsh(saved.total)}
              </p>
            </div>
          )}
        </div>

        {undoSecondsLeft > 0 && !voided && (
          <div className="rounded-2xl border border-pink-100 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Need to cancel this sale?
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  You have {undoSecondsLeft}s to cancel it.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUndoModal(true)}
                className="shrink-0 rounded-xl border border-pink-200 px-3 py-2 text-xs font-medium text-pink-700"
              >
                Cancel sale
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={startNewSale}
            className="w-full rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white"
          >
            Next Sale
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-2xl border border-pink-200 bg-white py-3.5 text-sm font-medium text-gray-700"
          >
            Back Home
          </button>
        </div>

        {showUndoModal && undoSecondsLeft > 0 && !voided && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel this sale?
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                This will cancel the sale and restore the stock.
              </p>

              <p className="mt-2 text-xs text-gray-400">
                You have {undoSecondsLeft}s remaining.
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUndoModal(false)}
                  disabled={voiding}
                  className="flex-1 rounded-xl border border-pink-200 py-3 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  Keep sale
                </button>

                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={voiding || undoSecondsLeft <= 0}
                  className="flex-1 rounded-xl bg-pink-600 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {voiding ? 'Cancelling...' : 'Cancel sale'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
