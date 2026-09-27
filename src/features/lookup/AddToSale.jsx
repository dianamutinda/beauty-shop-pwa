
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasketContext } from './BasketContext'

export default function AddToSale({ product }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useBasketContext()
  const navigate = useNavigate()

  const outOfStock = product.stock <= 0

  function handleAdd() {
    if (outOfStock) return

    addItem(product, quantity)
    navigate('/sale')
  }

  function increment() {
    setQuantity((q) => Math.min(q + 1, product.stock))
  }

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1))
  }

  return (
    <div className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Quantity</span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decrement}
            disabled={quantity <= 1}
            className="h-8 w-8 rounded-full border border-pink-200 text-pink-700 disabled:opacity-40"
          >
            −
          </button>

          <span className="w-6 text-center text-sm font-medium">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increment}
            disabled={quantity >= product.stock}
            className="h-8 w-8 rounded-full border border-pink-200 text-pink-700 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="w-full rounded-xl bg-pink-600 py-3 text-sm text-white disabled:opacity-50"
      >
        {outOfStock ? 'Out of stock' : 'Add to Sale'}
      </button>
    </div>
  )
}
