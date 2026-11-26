
import { useState, useMemo } from 'react'

export function useBasket() {
  const [items, setItems] = useState([])

  function addItem(product, quantity = 1) {
    if (product.stock <= 0) return

    const requestedQuantity = Math.max(1, Math.floor(quantity))

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id
      )

      if (existing) {
        const newQuantity = Math.min(
          existing.quantity + requestedQuantity,
          existing.stock
        )

        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: newQuantity }
            : i
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
          quantity: Math.min(requestedQuantity, product.stock),
          unitPrice: product.sellingPrice,
        },
      ]
    })
  }

  function updateQuantity(productId, quantity) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: Math.max(
                1,
                Math.min(quantity, i.stock)
              ),
            }
          : i
      )
    )
  }

  function updateUnitPrice(productId, unitPrice) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, unitPrice }
          : i
      )
    )
  }

  function removeItem(productId) {
    setItems((prev) =>
      prev.filter((i) => i.productId !== productId)
    )
  }

  function clear() {
    setItems([])
  }

  const total = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0
      ),
    [items]
  )

  const itemCount = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + i.quantity,
        0
      ),
    [items]
  )

  return {
    items,
    addItem,
    updateQuantity,
    updateUnitPrice,
    removeItem,
    clear,
    total,
    itemCount,
  }
}

