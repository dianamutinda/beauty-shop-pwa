import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listCategories } from '../../db/products'
import { listRecentProducts } from '../../db/recent'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning!'
  if (hour < 18) return 'Good afternoon!'
  return 'Good evening!'
}

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const categories = useLiveQuery(() => listCategories(), []) ?? []
  const recent = useLiveQuery(() => listRecentProducts(), []) ?? []

  function handleSubmit(e) {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{greeting()}</h2>
        <p className="text-sm text-gray-500">Find product prices and stock instantly.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search product name, SKU or category..."
          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
        />
      </form>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Categories</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/search?q=${encodeURIComponent(c.name)}`}
                className="rounded-xl border border-pink-100 bg-white px-2 py-4 text-center text-xs text-gray-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Recently viewed</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">Products you check will show up here.</p>
        ) : (
          <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
            {recent.map((p) => (
              <li key={p.id}>
                <Link to={`/product/${p.id}`} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      KSh {p.sellingPrice.toLocaleString()} · In stock: {p.stock}
                    </p>
                  </div>
                  <span className="text-gray-300">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}