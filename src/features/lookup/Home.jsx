import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listCategories } from '../../db/products'
import { listRecentProducts } from '../../db/recent'
import { useBasketContext} from './BasketContext'
import { formatKsh } from '../../lib/format'
import { Plus } from 'lucide-react'

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
  console.log('HOME BASKET:', itemCount, total)

  const categories = useLiveQuery(() => listCategories(), []) ?? []
  const recent = useLiveQuery(() => listRecentProducts(), []) ?? []

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
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {greeting()}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Find products, check prices, and make a sale.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="home-search" className="sr-only">
          Search products
        </label>

        <div className="relative">
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKU or category..."
            className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-400"
          />
        </div>
      </form>

      <button
  type="button"
  onClick={() => navigate('/sale')}
  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white"
>
  <Plus size={18} strokeWidth={2} />
  <span>New Sale</span>
</button>

      {/* Current Sale */}
      {itemCount > 0 && (
        <button
          type="button"
          onClick={() => navigate('/sale')}
          className="w-full rounded-2xl border border-pink-100 bg-white p-4 text-left shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Current sale
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-900">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold text-pink-700">
                {formatKsh(total)}
              </p>

              <p className="mt-1 text-xs font-medium text-pink-600">
                View sale →
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Categories */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Categories
          </h3>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-pink-100 bg-white px-4 py-5">
            <p className="text-sm text-gray-400">
              No categories yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/search?q=${encodeURIComponent(category.name)}`}
                className="rounded-2xl border border-pink-100 bg-white px-3 py-4 text-center text-xs font-medium text-gray-700 transition active:bg-pink-50"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Recently viewed
          </h3>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-pink-100 bg-white px-4 py-5">
            <p className="text-sm text-gray-400">
              Products you check will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-pink-100 overflow-hidden rounded-2xl border border-pink-100 bg-white">
            {recent.map((product) => (
              <li key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 active:bg-pink-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatKsh(product.sellingPrice)} · Stock:{' '}
                      {product.stock}
                    </p>
                  </div>

                  <span className="shrink-0 text-lg text-gray-300">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        
      </section>
    </div>
  )
}