import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getProductDetails, listCategories, updateProduct } from '../../db/products'
import ProductForm from './ProductForm'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const details = useLiveQuery(() => getProductDetails(id), [id])
  const categories = useLiveQuery(() => listCategories(), [])

  if (details === undefined || !categories) return null

  if (details === null) {
    return <p className="text-sm text-gray-500">This product no longer exists.</p>
  }

  const { product } = details

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-pink-700">Edit Product</h2>
      <ProductForm
        initial={{
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          sellingPrice: String(product.sellingPrice),
          stock: product.stock,
          buyingPrice: product.buyingPrice == null ? '' : String(product.buyingPrice),
          description: product.description ?? '',
        }}
        categories={categories}
        submitLabel="Update"
        onSubmit={async (values) => {
          await updateProduct(id, values)
          navigate('/owner/products')
        }}
      />
    </div>
  )
}