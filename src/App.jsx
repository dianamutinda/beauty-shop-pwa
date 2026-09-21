import { addCategory, addProduct, searchProducts, getProduct } from './db/products'
import { recordStockMovement, listMovements } from './db/stock'

export default function App() {
  async function test() {
    const cat = await addCategory({ name: 'Face Care' })
    await addProduct({
      sku: 'FC001',
      name: 'Face Cream',
      categoryId: cat.id,
      sellingPrice: '350',
      stock: '12',
    })
    console.log('done')
  }

  return (
    <button className="m-4 rounded bg-pink-600 px-4 py-2 text-white" onClick={test}>
      Test add
    </button>
  )
}

async function testStock() {
  const [product] = await searchProducts('face')
  await recordStockMovement(product.id, 'restock', 10)
  console.log((await getProduct(product.id)).stock) // 22

  try {
    await recordStockMovement(product.id, 'sale', -100)
  } catch (e) {
    console.log(e.message) // Only 22 in stock for Face Cream
  }

  console.log((await listMovements(product.id)).length) // 2
}