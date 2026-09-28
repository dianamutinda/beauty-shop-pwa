
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react'
import {
  listProducts,
  searchProducts,
} from '../../db/products'
import { applyStockCount } from '../../db/stock'

// null = nothing entered
// NaN = entered but invalid
// otherwise = the counted number
function parseCount(value) {
  if (value === undefined || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isInteger(number) && number >= 0
    ? number
    : NaN
}

export default function Count() {
  const [text, setText] = useState('')
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const all = useLiveQuery(
    () => listProducts(),
    []
  ) ?? []

  const visible = useLiveQuery(
    () => searchProducts(text),
    [text]
  ) ?? []

  const entered = all
    .map((product) => ({
      product,
      counted: parseCount(
        counts[product.id]
      ),
    }))
    .filter(
      (entry) => entry.counted !== null
    )

  const hasInvalid = entered.some(
    (entry) => Number.isNaN(entry.counted)
  )

  const changes = entered.filter(
    (entry) =>
      !Number.isNaN(entry.counted) &&
      entry.counted !== entry.product.stock
  )

  const net = changes.reduce(
    (sum, entry) =>
      sum +
      (entry.counted - entry.product.stock),
    0
  )

  function setCount(id, value) {
    setCounts((current) => ({
      ...current,
      [id]: value,
    }))

    setError('')
    setMessage('')
  }

  async function handleApply() {
    const word =
      changes.length === 1
        ? 'product'
        : 'products'

    if (
      !window.confirm(
        `Adjust stock for ${changes.length} ${word} to match your count?`
      )
    ) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const adjusted =
        await applyStockCount(
          changes.map((entry) => ({
            productId: entry.product.id,
            counted: entry.counted,
          }))
        )

      setCounts({})

      setMessage(
        `Done. ${adjusted} ${
          adjusted === 1
            ? 'product'
            : 'products'
        } adjusted.`
      )
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

        <span className="text-gray-400">
          Stock Count
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
            <ClipboardCheck
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-pink-700">
              Stock Count
            </h2>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Enter the quantity you actually count
              on the shelf.
            </p>
          </div>
        </div>

        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5 text-xs leading-5 text-gray-500">
          Nothing changes until you tap
          <span className="font-medium text-gray-700">
            {' '}
            Apply count
          </span>
          .
        </p>
      </div>

      {/* Count summary */}
      <section className="sticky top-0 z-10 rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-lg font-semibold text-gray-900">
              {entered.length}
            </p>

            <p className="mt-0.5 text-[11px] text-gray-400">
              Counted
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-center">
            <p className="text-lg font-semibold text-amber-700">
              {changes.length}
            </p>

            <p className="mt-0.5 text-[11px] text-amber-600">
              Different
            </p>
          </div>

          <div className="rounded-lg bg-pink-50 p-3 text-center">
            <p className="text-lg font-semibold text-pink-700">
              {net > 0 ? '+' : ''}
              {net}
            </p>

            <p className="mt-0.5 text-[11px] text-pink-600">
              Net units
            </p>
          </div>
        </div>

        {hasInvalid && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <AlertCircle
              size={16}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-xs leading-5 text-red-700">
              Counts must be whole numbers,
              0 or more.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <AlertCircle
              size={16}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-xs leading-5 text-red-700">
              {error}
            </p>
          </div>
        )}

        {message && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3">
            <CheckCircle2
              size={16}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <p className="text-xs leading-5 text-green-700">
              {message}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleApply}
          disabled={
            saving ||
            hasInvalid ||
            changes.length === 0
          }
          className="mt-3 w-full rounded-xl bg-pink-600 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : `Apply count (${changes.length})`}
        </button>
      </section>

      {/* Search */}
      <div className="relative">
        <Search
          size={17}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          value={text}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder="Search products..."
          className="w-full rounded-xl border border-pink-100 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50"
        />
      </div>

      {/* Product list */}
      {all.length === 0 ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No products to count yet
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            Add products before performing a stock
            count.
          </p>

          <Link
            to="/owner/products/new"
            className="mt-4 inline-flex rounded-lg bg-pink-600 px-4 py-2.5 text-xs font-medium text-white"
          >
            Add Product
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No products found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Nothing matches "{text}".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((product) => {
            const counted = parseCount(
              counts[product.id]
            )

            const invalid =
              Number.isNaN(counted)

            const diff =
              counted !== null &&
              !invalid
                ? counted - product.stock
                : null

            return (
              <div
                key={product.id}
                className="rounded-xl border border-pink-100 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      System stock: {product.stock}
                    </p>

                    {diff !== null && (
                      <div className="mt-2">
                        {diff === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2
                              size={14}
                              strokeWidth={1.8}
                            />
                            Matches
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600">
                            {diff > 0
                              ? '+'
                              : ''}
                            {diff}{' '}
                            {Math.abs(diff) ===
                            1
                              ? 'unit'
                              : 'units'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <label className="mb-1.5 block text-right text-[11px] font-medium text-gray-500">
                      Count
                    </label>

                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={
                        counts[
                          product.id
                        ] ?? ''
                      }
                      onChange={(event) =>
                        setCount(
                          product.id,
                          event.target.value
                        )
                      }
                      placeholder="0"
                      className={`w-20 rounded-lg border bg-gray-50 px-2 py-2.5 text-center text-sm font-medium outline-none ${
                        invalid
                          ? 'border-red-400 bg-red-50'
                          : 'border-pink-100 focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-50'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

