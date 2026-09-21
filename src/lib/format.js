export function formatKsh(amount) {
  return `KSh ${Number(amount).toLocaleString('en-KE')}`
}

// Temporary constant. On Day 6 this becomes a setting the owner can change.
const LOW_STOCK_LEVEL = 5

export function stockStatus(stock) {
  if (stock <= 0) return { label: 'Out of stock', className: 'text-red-600' }
  if (stock <= LOW_STOCK_LEVEL) return { label: `Low stock: ${stock}`, className: 'text-amber-600' }
  return { label: `In stock: ${stock}`, className: 'text-green-600' }
}

export function formatUpdated(iso) {
  const date = new Date(iso)
  const time = date.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' })
  if (date.toDateString() === new Date().toDateString()) return `Today, ${time}`
  const day = date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${day}, ${time}`
}