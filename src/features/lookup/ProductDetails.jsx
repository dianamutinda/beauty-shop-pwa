import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getProductDetails } from '../../db/products'
import { addRecentProduct } from '../../db/recent'
import { formatKsh, formatUpdated, stockStatus } from '../../lib/format'
import AddToSale from './AddToSale'

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
        <p className="text-sm text-gray-500">
          This product no longer exists.
        </p>

        <button
          onClick={() => navigate('/')}
          className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white"
        >
          Back to Home
        </button>
      </div>
    )
  }

  const { product, categoryName } = details
  const status = stockStatus(product.stock, product.lowStockAt)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-pink-600"
        >
          ‹ Back
        </button>

        <h2 className="text-2xl font-semibold text-gray-900">
          {product.name}
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          SKU: {product.sku}
        </p>
      </div>

      {/* Price */}
      <div className="rounded-2xl border border-pink-100 bg-pink-50 px-5 py-5">
        <p className="text-sm font-medium text-pink-700">
          Selling price
        </p>

        <p className="mt-1 text-3xl font-semibold text-gray-900">
          {formatKsh(product.sellingPrice)}
        </p>
      </div>

      {/* Product information */}
      <dl className="overflow-hidden rounded-2xl border border-pink-100 bg-white text-sm">
        <div className="flex items-center justify-between border-b border-pink-100 px-4 py-3.5">
          <dt className="text-gray-500">Stock</dt>

          <dd className={`font-medium ${status.className}`}>
            {status.label}
          </dd>
        </div>

        <div className="flex items-center justify-between border-b border-pink-100 px-4 py-3.5">
          <dt className="text-gray-500">Category</dt>

          <dd className="text-right text-gray-900">
            {categoryName}
          </dd>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <dt className="text-gray-500">Last updated</dt>

          <dd className="text-right text-gray-900">
            {formatUpdated(product.lastUpdated)}
          </dd>
        </div>
      </dl>

      {/* Sale action */}
      <AddToSale product={product} />
    </div>
  )
}