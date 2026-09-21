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
    <div className="space-y-4">
      <input
        type="search"
        value={text}
        onChange={handleChange}
        autoFocus={!text}
        placeholder="Search product name, SKU or category..."
        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
      />

      {results && (
        <>
          <p className="text-sm text-gray-500">
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </p>

          {results.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing matches "{text}". Try a different word or the SKU.</p>
          ) : (
            <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
              {results.map((p) => {
                const status = stockStatus(p.stock)
                return (
                  <li key={p.id}>
                    <Link to={`/product/${p.id}`} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                        <p className="text-sm font-semibold text-pink-700">{formatKsh(p.sellingPrice)}</p>
                        <p className={`text-xs ${status.className}`}>{status.label}</p>
                      </div>
                      <span className="text-gray-300">›</span>
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