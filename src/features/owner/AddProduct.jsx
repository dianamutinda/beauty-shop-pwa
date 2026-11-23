import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { addProduct, listCategories } from '../../db/products'

import ProductForm from './ProductForm'
import PageContainer from '../../components/layout/PageContainer'
import PageHeader from '../../components/layout/PageHeader'

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

  if (!categories) return null

  async function handleSubmit(values) {
    await addProduct(values)

    // The product is saved locally.
    // Sync with Supabase happens separately.
    navigate('/owner/products')
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Add Product"
          description="Add a product to your shop inventory."
          
        />

        <ProductForm
          isNew
          initial={EMPTY}
          categories={categories}
          submitLabel="Save Product"
          onSubmit={handleSubmit}
        />
      </div>
    </PageContainer>
  )
}