
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, Plus, ChevronRight } from 'lucide-react'
import { searchProducts } from '../../db/products'
import { formatKsh, stockStatus } from '../../lib/format'

function ProductCard({ product }) {
  const status = stockStatus(product.stock)

  return (
    <Link
      to={`/owner/products/${product.id}/edit`}
      className="block rounded-xl border border-pink-100 bg-white p-4 transition-colors hover:bg-pink-50/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {product.name}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            SKU: {product.sku}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-medium ${status.className}`}
            >
              {status.label}
            </span>

            <span className="text-xs text-gray-400">
              {product.stock} in stock
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-pink-700">
              {formatKsh(product.sellingPrice)}
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              Selling price
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

export default function Products() {
  const [text, setText] = useState('')

  const products = useLiveQuery(
    () => searchProducts(text),
    [text]
  )

  return (
    <div className="space-y-5">
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
            Products
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-pink-700">
              Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage products, prices, and stock.
            </p>
          </div>

          <Link
            to="/owner/products/new"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-pink-600 px-3 py-2 text-xs font-medium text-white"
          >
            <Plus size={15} strokeWidth={2} />
            Add Product
          </Link>
        </div>
      </div>

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
          placeholder="Search by name or SKU..."
          className="w-full rounded-xl border border-pink-100 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50"
        />
      </div>

      {!products ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
          Loading products...
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              {products.length}{' '}
              {products.length === 1 ? 'product' : 'products'}
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

          {products.length === 0 ? (
            <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
              <p className="text-sm font-medium text-gray-700">
                {text ? 'No products found' : 'No products yet'}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                {text
                  ? `Nothing matches "${text}". Try another name or SKU.`
                  : 'Add your first product to start managing your inventory.'}
              </p>

              {!text && (
                <Link
                  to="/owner/products/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2.5 text-xs font-medium text-white"
                >
                  <Plus size={15} strokeWidth={2} />
                  Add First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <ProductCard
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
