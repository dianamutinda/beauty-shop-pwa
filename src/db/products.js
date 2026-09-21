import { db } from './index'
import { getShopId } from './shop'

export async function addCategory({ name, icon = null }) {
  const shopId = await getShopId()
  const category = {
    id: crypto.randomUUID(),
    shopId,
    name: name.trim(),
    icon,
    synced: 0,
  }
  await db.categories.add(category)
  return category
}

export async function listCategories() {
  const shopId = await getShopId()
  return db.categories.where('shopId').equals(shopId).sortBy('name')
}

export async function addProduct({
  sku,
  name,
  categoryId,
  sellingPrice,
  stock = 0,
  buyingPrice = null,
  description = '',
  attributes = {},
}) {
  const shopId = await getShopId()
  const timestamp = new Date().toISOString()

  const product = {
    id: crypto.randomUUID(),
    shopId,
    sku: sku.trim(),
    name: name.trim(),
    categoryId,
    sellingPrice: Number(sellingPrice),
    buyingPrice: buyingPrice === null || buyingPrice === '' ? null : Number(buyingPrice),
    description,
    attributes,
    stock: Number(stock),
    lastUpdated: timestamp,
    synced: 0,
  }

  await db.transaction('rw', db.products, db.stockMovements, async () => {
    await db.products.add(product)

    if (product.stock > 0) {
      await db.stockMovements.add({
        id: crypto.randomUUID(),
        shopId,
        productId: product.id,
        type: 'opening',
        quantity: product.stock,
        timestamp,
        synced: 0,
      })
    }
  })

  return product
}
const EDITABLE_FIELDS = [
  'sku', 'name', 'categoryId', 'sellingPrice',
  'buyingPrice', 'description', 'attributes',
]

export async function getProduct(id) {
  return db.products.get(id)
}

export async function listProducts() {
  const shopId = await getShopId()
  return db.products.where('shopId').equals(shopId).sortBy('name')
}

export async function updateProduct(id, changes) {
  const updates = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in changes) updates[field] = changes[field]
  }

  if ('sku' in updates) updates.sku = updates.sku.trim()
  if ('name' in updates) updates.name = updates.name.trim()
  if ('sellingPrice' in updates) updates.sellingPrice = Number(updates.sellingPrice)
  if ('buyingPrice' in updates) {
    const value = updates.buyingPrice
    updates.buyingPrice = value === null || value === '' ? null : Number(value)
  }

  const count = await db.products.update(id, {
    ...updates,
    lastUpdated: new Date().toISOString(),
    synced: 0,
  })
  if (count === 0) throw new Error(`Product ${id} not found`)
}

export async function searchProducts(query) {
  const q = query.trim().toLowerCase()
  const [products, categories] = await Promise.all([listProducts(), listCategories()])
  if (!q) return products

  const categoryNames = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]))

  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (categoryNames.get(p.categoryId) ?? '').includes(q)
  )
}