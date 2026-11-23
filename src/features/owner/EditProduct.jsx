import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getProductDetails,
  listCategories,
  updateProduct,
} from '../../db/products'

import ProductForm from './ProductForm'
import PageContainer from '../../components/layout/PageContainer'
import PageHeader from '../../components/layout/PageHeader'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()

  const details = useLiveQuery(() => getProductDetails(id), [id])
  const categories = useLiveQuery(() => listCategories(), [])

  if (details === undefined || !categories) return null

  if (details === null) {
    return (
      <PageContainer>
        <div className="py-8">
          <p className="text-sm text-text-secondary">
            This product no longer exists.
          </p>
        </div>
      </PageContainer>
    )
  }

  const { product } = details

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Edit Product"
          description="Update the product information and save your changes."
          
        />

        <ProductForm
          initial={{
            name: product.name,
            sku: product.sku,
            categoryId: product.categoryId,
            sellingPrice: String(product.sellingPrice),
            stock: product.stock,
            buyingPrice:
              product.buyingPrice == null
                ? ''
                : String(product.buyingPrice),
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
    </PageContainer>
  )
}