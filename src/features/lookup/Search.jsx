import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { searchProducts } from '../../db/products'
import { formatKsh, stockStatus } from '../../lib/format'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [text, setText] = useState(params.get('q') ?? '')

  const results = useLiveQuery(() => searchProducts(text), [text])

  function handleChange(e) {
    const value = e.target.value

    setText(value)
    setParams(value ? { q: value } : {}, { replace: true })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Search products
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Find a product by name, SKU, or category.
        </p>
      </div>

      {/* Search */}
      <div>
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>

        <input
          id="product-search"
          type="search"
          value={text}
          onChange={handleChange}
          autoFocus={!text}
          placeholder="Search product name, SKU or category..."
          className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
        />
      </div>

      {/* Results */}
      {results && (
        <section className="space-y-3">
          <p className="text-sm text-gray-500">
            {results.length}{' '}
            {results.length === 1 ? 'product' : 'products'} found
          </p>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-6">
              <p className="text-sm text-gray-500">
                Nothing matches "{text}".
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Try a different word or search by SKU.
              </p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
              {results.map((product) => {
                const status = stockStatus(product.stock)

                return (
                  <li
                    key={product.id}
                    className="border-b border-pink-100 last:border-b-0"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="flex items-center justify-between gap-4 px-4 py-4 transition active:bg-pink-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          SKU: {product.sku}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-sm font-semibold text-pink-700">
                            {formatKsh(product.sellingPrice)}
                          </p>

                          <span className="text-gray-300">·</span>

                          <p className={`text-xs ${status.className}`}>
                            {status.label}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-lg text-gray-300">
                        ›
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}