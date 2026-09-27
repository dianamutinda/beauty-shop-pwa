import { createContext, useContext } from 'react'
import { useBasket } from './useBasket'

const BasketContext = createContext(null)

export function BasketProvider({ children }) {
  const basket = useBasket()

  return (
    <BasketContext.Provider value={basket}>
      {children}
    </BasketContext.Provider>
  )
}

export function useBasketContext() {
  const ctx = useContext(BasketContext)

  if (!ctx) {
    throw new Error('useBasketContext must be used within BasketProvider')
  }

  return ctx
}