import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { searchProducts } from '../../db/products'
import { getLowStockDefault, setLowStockDefault } from '../../db/settings'
import { stockStatus } from '../../lib/format'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low Stock' },
  { id: 'in', label: 'In Stock' },
]

function matchesFilter(filter, product) {
  if (filter === 'low') return product.stock <= product.lowStockAt
  if (filter === 'in') return product.stock > product.lowStockAt
  return true
}

export default function Stock() {
  const [text, setText] = useState('')
  const [params] = useSearchParams()
  const [filter, setFilter] = useState(params.get('filter') === 'low' ? 'low' : 'all')

  const products = useLiveQuery(() => searchProducts(text), [text])
  const lowDefault = useLiveQuery(() => getLowStockDefault(), [])
  const visible = (products ?? []).filter((p) => matchesFilter(filter, p))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-pink-700">Stock Update</h2>
        <Link to="/owner/count" className="rounded-xl border border-pink-300 px-3 py-1 text-sm text-pink-700">
          Count stock
        </Link>
      </div>

      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1 text-sm ${
              filter === f.id ? 'bg-pink-600 text-white' : 'border border-pink-200 bg-white text-pink-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {lowDefault !== undefined && (
        <div className="flex items-center justify-between rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-600">
          <span>Default: warn at or below</span>
          <input
            key={lowDefault}
            type="number"
            min="0"
            defaultValue={lowDefault}
            onBlur={(e) =>
              setLowStockDefault(e.target.value).catch(() => {
                e.target.value = lowDefault
              })
            }
            className="w-16 rounded-lg border border-pink-200 px-2 py-1 text-center"
          />
        </div>
      )}

      {products && visible.length === 0 && (
        <p className="text-sm text-gray-400">
          {products.length === 0 ? 'No products yet.' : 'No products match this filter.'}
        </p>
      )}

      {visible.length > 0 && (
        <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
          {visible.map((p) => {
            const status = stockStatus(p.stock, p.lowStockAt)
            return (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className={`text-xs ${status.className}`}>{status.label}</p>
                </div>
                <Link
                  to={`/owner/stock/${p.id}`}
                  className="rounded-full bg-pink-100 px-4 py-1 text-sm text-pink-700"
                >
                  Update
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}