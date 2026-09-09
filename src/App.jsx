import { useState } from 'react'
import { db, recordStockMovement } from './db'

function App() {
  const [productId, setProductId] = useState(null)

  async function handleCreateProduct() {
    const newId = await db.products.add({
      sku: 'FC001',
      name: 'Face Cream',
      category: 'Face Care',
      sellingPrice: 350,
      stock: 12,
      lastUpdated: new Date().toISOString(),
      synced: false,
    })
    setProductId(newId)
    console.log('Created product:', newId)
  }

  async function handleAddStock() {
    if (!productId) {
      console.log('Create a product first')
      return
    }
    await recordStockMovement(productId, 'restock', 10)
    const updated = await db.products.get(productId)
    console.log('Stock now:', updated.stock)
  }

  return (
    <div className="p-4 space-x-2">
      <button onClick={handleCreateProduct} className="bg-gray-600 text-white px-4 py-2 rounded">
        Create Product
      </button>
      <button onClick={handleAddStock} className="bg-pink-600 text-white px-4 py-2 rounded">
        Add Stock (+10)
      </button>
    </div>
  )
}

export default App