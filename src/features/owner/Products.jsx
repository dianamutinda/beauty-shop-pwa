import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { searchProducts } from '../../db/products'
import { formatKsh, stockStatus } from '../../lib/format'

export default function Products() {
  const [text, setText] = useState('')
  const products = useLiveQuery(() => searchProducts(text), [text])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-pink-700">Products</h2>
        <Link to="/owner/products/new" className="rounded-xl bg-pink-600 px-4 py-2 text-sm text-white">
          + Add Product
        </Link>
      </div>

      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
      />

      {products && (
        <>
          <p className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>

          {products.length === 0 ? (
            <p className="text-sm text-gray-400">
              {text ? `Nothing matches "${text}".` : 'No products yet. Tap "Add Product" to create the first one.'}
            </p>
          ) : (
            <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
              {products.map((p) => {
                const status = stockStatus(p.stock)
                return (
                  <li key={p.id}>
                    <Link to={`/owner/products/${p.id}/edit`} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                        <p className={`text-xs ${status.className}`}>{status.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-pink-700">{formatKsh(p.sellingPrice)}</p>
                        <p className="text-xs text-gray-300">Edit ›</p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}