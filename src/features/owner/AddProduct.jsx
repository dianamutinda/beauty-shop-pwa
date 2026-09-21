import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { addProduct, listCategories } from '../../db/products'
import ProductForm from './ProductForm'

const EMPTY = {
  name: '', sku: '', categoryId: '',
  sellingPrice: '', stock: '', buyingPrice: '', description: '',
}

export default function AddProduct() {
  const navigate = useNavigate()
  const categories = useLiveQuery(() => listCategories(), [])

  if (!categories) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-pink-700">Add Product</h2>
      <ProductForm
        isNew
        initial={EMPTY}
        categories={categories}
        submitLabel="Save Product"
        onSubmit={async (values) => {
          await addProduct(values)
          navigate('/owner/products')
        }}
      />
    </div>
  )
}