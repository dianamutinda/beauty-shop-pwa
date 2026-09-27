
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
  <div className="space-y-4 rounded-2xl border border-pink-100 bg-white p-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        Quantity
      </span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={quantity <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-200 text-lg text-pink-700 disabled:opacity-40"
        >
          −
        </button>

        <span className="w-6 text-center text-sm font-medium text-gray-900">
          {quantity}
        </span>

        <button
          type="button"
          onClick={increment}
          disabled={quantity >= product.stock}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-200 text-lg text-pink-700 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>

    <button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      className="w-full rounded-xl bg-pink-600 py-3.5 text-sm font-medium text-white disabled:opacity-50"
    >
      {outOfStock ? 'Out of stock' : 'Add to Sale'}
    </button>
  </div>
)
}