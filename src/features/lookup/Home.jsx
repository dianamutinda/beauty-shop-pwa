
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Search,
  Plus,
  ChevronRight,
  Tags,
} from 'lucide-react'

import { listCategories } from '../../db/products'
import { listRecentProducts } from '../../db/recent'
import { useBasketContext } from './BasketContext'
import { formatKsh } from '../../lib/format'

function greeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning!'
  if (hour < 18) return 'Good afternoon!'
  return 'Good evening!'
}

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const { total, itemCount } = useBasketContext()

  const categories =
    useLiveQuery(() => listCategories(), []) ?? []

  const recent =
    useLiveQuery(() => listRecentProducts(), []) ?? []

  function handleSubmit(e) {
    e.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      navigate('/search')
      return
    }

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <section>
        <p className="text-xs font-medium text-pink-600">
          Worker Dashboard
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
          {greeting()}
        </h2>

        <p className="mt-1 text-sm leading-5 text-gray-500">
          Find products, check prices, and make a sale.
        </p>
      </section>

      {/* Search */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="home-search" className="sr-only">
          Search products
        </label>

        <div className="relative">
          <Search
            size={18}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKU or category..."
            className="w-full rounded-2xl border border-pink-100 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50"
          />
        </div>
      </form>

      {/* New Sale */}
      <button
        type="button"
        onClick={() => navigate('/sale')}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white shadow-sm transition active:bg-pink-700"
      >
        <Plus size={18} strokeWidth={2} />
        <span>New Sale</span>
      </button>

      {/* Current Sale */}
      {itemCount > 0 && (
        <button
          type="button"
          onClick={() => navigate('/sale')}
          className="w-full rounded-2xl border border-pink-100 bg-white p-4 text-left shadow-sm transition active:bg-pink-50"
        >
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
              <span className="text-sm font-semibold">
                {itemCount}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-400">
                Current sale
              </p>

              <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                {itemCount}{' '}
                {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-pink-700">
                {formatKsh(total)}
              </p>

              <p className="mt-0.5 text-[11px] font-medium text-pink-600">
                View sale
              </p>
            </div>

            <ChevronRight
              size={17}
              strokeWidth={1.8}
              className="shrink-0 text-gray-300"
            />
          </div>
        </button>
      )}

      {/* Categories */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Categories
            </h3>

            <p className="mt-0.5 text-xs text-gray-400">
              Browse products by category
            </p>
          </div>

          <Tags
            size={17}
            strokeWidth={1.8}
            className="text-pink-400"
          />
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-pink-100 bg-white px-4 py-5">
            <p className="text-sm text-gray-400">
              No categories yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/search?q=${encodeURIComponent(category.name)}`}
                className="flex min-h-[58px] items-center rounded-2xl border border-pink-100 bg-white px-4 py-3 text-left transition active:bg-pink-50"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                  {category.name}
                </span>

                <ChevronRight
                  size={15}
                  strokeWidth={1.8}
                  className="ml-2 shrink-0 text-gray-300"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Recently viewed
          </h3>

          <p className="mt-0.5 text-xs text-gray-400">
            Products you've checked recently
          </p>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-pink-100 bg-white px-4 py-5">
            <p className="text-sm text-gray-400">
              Products you check will show up here.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
            {recent.map((product) => (
              <li
                key={product.id}
                className="border-b border-pink-50 last:border-b-0"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition active:bg-pink-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-xs font-medium text-pink-700">
                    {product.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatKsh(product.sellingPrice)}
                      {' · '}
                      Stock: {product.stock}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    strokeWidth={1.8}
                    className="shrink-0 text-gray-300"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
