import { useState, useMemo } from 'react'

export function useBasket() {
  const [items, setItems] = useState([]) // { productId, name, sku, stock, sellingPrice, quantity, unitPrice }

  function addItem(product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          sellingPrice: product.sellingPrice,
          quantity: 1,
          unitPrice: product.sellingPrice,
        },
      ]
    })
  }

  function updateQuantity(productId, quantity) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    )
  }

  function updateUnitPrice(productId, unitPrice) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, unitPrice } : i))
    )
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function clear() {
    setItems([])
  }

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items]
  )
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  return { items, addItem, updateQuantity, updateUnitPrice, removeItem, clear, total, itemCount }
}