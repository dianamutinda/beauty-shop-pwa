
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react'
import { getProductDetails } from '../../db/products'
import {
  listMovements,
  recordStockMovement,
} from '../../db/stock'
import {
  formatKsh,
  formatUpdated,
  stockStatus,
} from '../../lib/format'

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
  'w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50'

export default function StockUpdate() {
  const { id } = useParams()

  const details = useLiveQuery(
    () => getProductDetails(id),
    [id]
  )

  const movements =
    useLiveQuery(
      () => listMovements(id),
      [id]
    ) ?? []

  const [mode, setMode] = useState('add')
  const [reasonIndex, setReasonIndex] = useState(0)
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  if (details === undefined) {
    return (
      <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
        Loading product...
      </div>
    )
  }

  if (details === null) {
    return (
      <div className="space-y-4">
        <Link
          to="/owner/stock"
          className="inline-flex items-center gap-1 text-xs font-medium text-pink-700"
        >
          <ChevronLeft size={15} />
          Stock
        </Link>

        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            Product not found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            This product no longer exists.
          </p>
        </div>
      </div>
    )
  }

  const { product } = details

  const status = stockStatus(
    product.stock,
    product.lowStockAt
  )

  const isSale =
    mode === 'remove' &&
    REASONS.remove[reasonIndex].type === 'sale'

  function switchMode(next) {
    setMode(next)
    setReasonIndex(0)
    setPrice('')
    setError('')
    setMessage('')
  }

  function changeReason(event) {
    setReasonIndex(
      Number(event.target.value)
    )

    setPrice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setMessage('')

    const qty = Number(quantity)

    if (!Number.isInteger(qty) || qty <= 0) {
      setError(
        'Enter a whole number greater than zero.'
      )
      return
    }

    const reason =
      REASONS[mode][reasonIndex]

    const signed =
      mode === 'add' ? qty : -qty

    const fullNote = [
      reason.label,
      note.trim(),
    ]
      .filter(Boolean)
      .join(': ')

    let unitPrice = null
    let listPrice = null

    if (reason.type === 'sale') {
      listPrice = product.sellingPrice

      unitPrice =
        price === ''
          ? listPrice
          : Number(price)

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        setError(
          'Enter the price per unit as a number, 0 or more.'
        )
        return
      }
    }

    setSaving(true)

    try {
      const newStock =
        await recordStockMovement(
          id,
          reason.type,
          signed,
          {
            note: fullNote,
            unitPrice,
            listPrice,
          }
        )

      setMessage(
        `Saved. Stock is now ${newStock}.`
      )

      setQuantity('')
      setPrice('')
      setNote('')
    } catch (err) {
      setError(
        err.message ||
          'Could not save. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs">
        <Link
          to="/owner"
          className="font-medium text-pink-700"
        >
          Dashboard
        </Link>

        <span className="text-gray-300">
          /
        </span>

        <Link
          to="/owner/stock"
          className="font-medium text-pink-700"
        >
          Stock
        </Link>

        <span className="text-gray-300">
          /
        </span>

        <span className="max-w-[140px] truncate text-gray-400">
          {product.name}
        </span>
      </div>

      {/* Product header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {product.name}
        </h2>

        <p className="mt-1 text-xs text-gray-400">
          SKU: {product.sku}
        </p>
      </div>

      {/* Current stock */}
      <section className="rounded-xl border border-pink-100 bg-pink-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-pink-700">
              Current stock
            </p>

            <p className="mt-1 text-4xl font-semibold tracking-tight text-pink-800">
              {product.stock}
            </p>

            <p className="mt-1 text-xs text-pink-600">
              {product.stock === 1
                ? 'unit available'
                : 'units available'}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </section>

      {/* Stock form */}
      <section className="rounded-xl border border-pink-100 bg-white p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            Update stock
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            Record a stock movement so your inventory
            history stays accurate.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Add / Remove */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchMode('add')}
              className={
                mode === 'add'
                  ? 'flex items-center justify-center gap-1.5 rounded-xl bg-pink-600 py-3 text-xs font-medium text-white'
                  : 'flex items-center justify-center gap-1.5 rounded-xl border border-pink-100 bg-white py-3 text-xs font-medium text-gray-600'
              }
            >
              <ArrowUpFromLine
                size={15}
                strokeWidth={1.8}
              />
              Add stock
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode('remove')
              }
              className={
                mode === 'remove'
                  ? 'flex items-center justify-center gap-1.5 rounded-xl bg-pink-600 py-3 text-xs font-medium text-white'
                  : 'flex items-center justify-center gap-1.5 rounded-xl border border-pink-100 bg-white py-3 text-xs font-medium text-gray-600'
              }
            >
              <ArrowDownToLine
                size={15}
                strokeWidth={1.8}
              />
              Remove stock
            </button>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Reason
            </label>

            <select
              className={inputClass}
              value={reasonIndex}
              onChange={changeReason}
            >
              {REASONS[mode].map(
                (reason, index) => (
                  <option
                    key={reason.label}
                    value={index}
                  >
                    {reason.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Quantity
            </label>

            <input
              className={inputClass}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
              placeholder="e.g. 10"
              required
            />
          </div>

          {/* Sale price */}
          {isSale && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Price per unit
              </label>

              <input
                className={inputClass}
                type="number"
                inputMode="numeric"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value
                  )
                }
                placeholder={`Default: ${formatKsh(product.sellingPrice)}`}
              />

              <p className="mt-1.5 text-xs leading-5 text-gray-400">
                Leave blank to use the product's
                current selling price.
              </p>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Note
              <span className="font-normal text-gray-400">
                {' '}
                (optional)
              </span>
            </label>

            <input
              className={inputClass}
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Add a note..."
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5">
              <AlertCircle
                size={17}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p className="text-sm leading-5 text-red-700">
                {error}
              </p>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50 p-3.5">
              <CheckCircle2
                size={17}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <p className="text-sm leading-5 text-green-700">
                {message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-pink-600 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving
              ? 'Saving...'
              : 'Save Stock Update'}
          </button>
        </form>
      </section>

      {/* History */}
      <section>
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Stock History
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Recent changes to this product's stock.
          </p>
        </div>

        {movements.length === 0 ? (
          <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
            <p className="text-sm font-medium text-gray-700">
              No stock movements yet
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Stock changes will appear here after
              you save an update.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {movements.map((movement) => {
              const isAddition =
                movement.quantity > 0

              return (
                <div
                  key={movement.id}
                  className="rounded-xl border border-pink-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {movement.note ||
                          TYPE_LABELS[
                            movement.type
                          ] ||
                          movement.type}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatUpdated(
                          movement.timestamp
                        )}

                        {movement.type ===
                          'sale' &&
                          movement.unitPrice !=
                            null && (
                            <>
                              {' '}
                              · @{' '}
                              {formatKsh(
                                movement.unitPrice
                              )}

                              {movement.listPrice !=
                                null &&
                                movement.unitPrice <
                                  movement.listPrice &&
                                ` (list ${formatKsh(movement.listPrice)})`}
                            </>
                          )}
                      </p>
                    </div>

                    <span
                      className={
                        isAddition
                          ? 'shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700'
                          : 'shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600'
                      }
                    >
                      {isAddition ? '+' : ''}
                      {movement.quantity}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

