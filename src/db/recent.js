import { db } from './index'

const KEY = 'recentProducts'
const MAX_RECENT = 10

export async function addRecentProduct(productId) {
  const entry = await db.settings.get(KEY)
  const current = entry?.value ?? []

  const next = [
    { id: productId, viewedAt: new Date().toISOString() },
    ...current.filter((r) => r.id !== productId),
  ].slice(0, MAX_RECENT)

  await db.settings.put({ key: KEY, value: next })
}

export async function listRecentProducts() {
  const entry = await db.settings.get(KEY)
  const recent = entry?.value ?? []

  const products = await db.products.bulkGet(recent.map((r) => r.id))

  return recent
    .map((r, i) => (products[i] ? { ...products[i], viewedAt: r.viewedAt } : null))
    .filter(Boolean)
}