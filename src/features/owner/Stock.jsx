
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Search,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { searchProducts } from '../../db/products'
import {
  getLowStockDefault,
  setLowStockDefault,
} from '../../db/settings'
import { stockStatus } from '../../lib/format'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low Stock' },
  { id: 'in', label: 'In Stock' },
]

function matchesFilter(filter, product) {
  if (filter === 'low') {
    return product.stock <= product.lowStockAt
  }

  if (filter === 'in') {
    return product.stock > product.lowStockAt
  }

  return true
}

function StockCard({ product }) {
  const status = stockStatus(
    product.stock,
    product.lowStockAt
  )

  return (
    <Link
      to={`/owner/stock/${product.id}`}
      className="block rounded-xl border border-pink-100 bg-white p-4 transition-colors hover:bg-pink-50/30"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {product.name}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-medium ${status.className}`}
            >
              {status.label}
            </span>

            <span className="text-xs text-gray-400">
              {product.stock}{' '}
              {product.stock === 1 ? 'unit' : 'units'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {product.stock}
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              In stock
            </p>
          </div>

          <ChevronRight
            size={17}
            strokeWidth={1.8}
            className="text-gray-300"
          />
        </div>
      </div>
    </Link>
  )
}

export default function Stock() {
  const [text, setText] = useState('')

  const [params] = useSearchParams()

  const [filter, setFilter] = useState(
    params.get('filter') === 'low'
      ? 'low'
      : 'all'
  )

  const products = useLiveQuery(
    () => searchProducts(text),
    [text]
  )

  const lowDefault = useLiveQuery(
    () => getLowStockDefault(),
    []
  )

  const visible = (products ?? []).filter(
    (product) => matchesFilter(filter, product)
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            to="/owner"
            className="font-medium text-pink-700"
          >
            Dashboard
          </Link>

          <span className="text-gray-300">/</span>

          <span className="text-gray-400">
            Stock
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-pink-700">
              Stock
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update and review your inventory levels.
            </p>
          </div>

          <Link
            to="/owner/count"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-pink-200 bg-white px-3 py-2 text-xs font-medium text-pink-700"
          >
            <SlidersHorizontal
              size={15}
              strokeWidth={1.8}
            />
            Count Stock
          </Link>
        </div>
      </div>

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
          onChange={(e) => setText(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-pink-100 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={
              filter === item.id
                ? 'shrink-0 rounded-full bg-pink-600 px-4 py-2 text-xs font-medium text-white'
                : 'shrink-0 rounded-full border border-pink-100 bg-white px-4 py-2 text-xs font-medium text-gray-600'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Low-stock threshold */}
      {lowDefault !== undefined && (
        <div className="rounded-xl border border-pink-100 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Low-stock warning
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Warn when stock reaches this quantity or below.
              </p>
            </div>

            <input
              key={lowDefault}
              type="number"
              min="0"
              defaultValue={lowDefault}
              onBlur={(e) =>
                setLowStockDefault(
                  e.target.value
                ).catch(() => {
                  e.target.value = lowDefault
                })
              }
              className="w-16 rounded-lg border border-pink-100 bg-gray-50 px-2 py-2 text-center text-sm font-medium text-gray-700 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-50"
            />
          </div>
        </div>
      )}

      {/* Results */}
      {!products ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
          Loading stock...
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              {visible.length}{' '}
              {visible.length === 1
                ? 'product'
                : 'products'}
            </p>

            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-xs font-medium text-pink-700"
              >
                Clear search
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
              <p className="text-sm font-medium text-gray-700">
                {products.length === 0
                  ? 'No products yet'
                  : 'No products found'}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                {products.length === 0
                  ? 'Add products before managing their stock.'
                  : text
                    ? `Nothing matches "${text}". Try another product name.`
                    : 'No products match this stock filter.'}
              </p>

              {products.length === 0 && (
                <Link
                  to="/owner/products/new"
                  className="mt-4 inline-flex rounded-lg bg-pink-600 px-4 py-2.5 text-xs font-medium text-white"
                >
                  Add Product
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((product) => (
                <StockCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

