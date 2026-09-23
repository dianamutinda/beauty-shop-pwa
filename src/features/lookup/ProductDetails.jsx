import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getProductDetails } from '../../db/products'
import { addRecentProduct } from '../../db/recent'
import { formatKsh, formatUpdated, stockStatus } from '../../lib/format'
import SaleForm from './SaleForm'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const details = useLiveQuery(() => getProductDetails(id), [id])

  const found = Boolean(details)
  useEffect(() => {
    if (found) addRecentProduct(id)
  }, [id, found])

  if (details === undefined) return null

  if (details === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">This product no longer exists.</p>
        <button onClick={() => navigate('/')} className="rounded-xl bg-pink-600 px-4 py-2 text-sm text-white">
          Back to Home
        </button>
      </div>
    )
  }

  const { product, categoryName } = details
  const status = stockStatus(product.stock, product.lowStockAt)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
        <p className="text-sm text-gray-400">SKU: {product.sku}</p>
      </div>

      <div className="rounded-xl bg-pink-100 px-4 py-5">
        <p className="text-sm text-pink-800">Selling Price</p>
        <p className="text-4xl font-bold text-pink-700">{formatKsh(product.sellingPrice)}</p>
      </div>

      <dl className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white text-sm">
        <div className="flex justify-between px-4 py-3">
          <dt className="text-gray-500">Stock</dt>
          <dd className={`font-medium ${status.className}`}>{status.label}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-gray-500">Category</dt>
          <dd className="text-gray-900">{categoryName}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-gray-500">Last updated</dt>
          <dd className="text-gray-900">{formatUpdated(product.lastUpdated)}</dd>
        </div>
      </dl>

      <SaleForm product={product} />

      <button onClick={() => navigate(-1)} className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white">
        Back
      </button>
    </div>
  )
}