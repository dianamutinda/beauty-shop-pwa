
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { addProduct, listCategories } from '../../db/products'
import ProductForm from './ProductForm'

const EMPTY = {
  name: '',
  sku: '',
  categoryId: '',
  sellingPrice: '',
  stock: '',
  buyingPrice: '',
  description: '',
}

export default function AddProduct() {
  const navigate = useNavigate()
  const categories = useLiveQuery(() => listCategories(), [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!categories) return null

  async function handleSubmit(values) {
    setSaving(true)
    setError('')

    try {
      await addProduct(values)

      // The product is already saved locally.
      // Sync with Supabase will happen separately.
      navigate('/owner/products')
    } catch (err) {
      setError(err.message || 'Could not save product')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-pink-700">
          Add Product
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add a product to your shop inventory.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <ProductForm
        isNew
        initial={EMPTY}
        categories={categories}
        submitLabel={saving ? 'Saving...' : 'Save Product'}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
