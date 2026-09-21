import { db } from './index'
import { getShopId } from './shop'
import { getLowStockDefault } from './settings'

async function assertCategoryNameFree(name, exceptId = null) {
  const existing = await listCategories()
  const wanted = name.trim().toLowerCase()
  const clash = existing.some((c) => c.id !== exceptId && c.name.toLowerCase() === wanted)
  if (clash) {
    const err = new Error('Category already exists')
    err.name = 'ConstraintError'
    throw err
  }
}

export async function addCategory({ name, icon = null }) {
  const clean = name.trim()
  if (!clean) throw new Error('Category name is required')
  await assertCategoryNameFree(clean)

  const shopId = await getShopId()
  const category = { id: crypto.randomUUID(), shopId, name: clean, icon, synced: 0 }
  await db.categories.add(category)
  return category
}

export async function listCategoriesWithCounts() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()])

  const counts = new Map()
  for (const p of products) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1)

  return categories.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }))
}

export async function renameCategory(id, name) {
  const clean = name.trim()
  if (!clean) throw new Error('Category name is required')
  await assertCategoryNameFree(clean, id)

  const count = await db.categories.update(id, { name: clean, synced: 0 })
  if (count === 0) throw new Error('Category not found')
}

export async function deleteCategory(id) {
  const inUse = await db.products.where('categoryId').equals(id).count()
  if (inUse > 0) {
    throw new Error(`${inUse} ${inUse === 1 ? 'product uses' : 'products use'} this category. Move them first.`)
  }
  await db.categories.delete(id)
}

export async function listCategories() {
  const shopId = await getShopId()
  return db.categories.where('shopId').equals(shopId).sortBy('name')
}

function toNumberOrNull(value) {
  return value === null || value === undefined || value === '' ? null : Number(value)
}

function withLowStockAt(product, defaultLevel) {
  return { ...product, lowStockAt: product.lowStockLevel ?? defaultLevel }
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
  const [products, defaultLevel] = await Promise.all([
    db.products.where('shopId').equals(shopId).sortBy('name'),
    getLowStockDefault(),
  ])
  return products.map((p) => withLowStockAt(p, defaultLevel))
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
  if ('lowStockLevel' in updates) updates.lowStockLevel = toNumberOrNull(updates.lowStockLevel)

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
export async function getProductDetails(id) {
  const product = await db.products.get(id)
  if (!product) return null

  const [category, defaultLevel] = await Promise.all([
    db.categories.get(product.categoryId),
    getLowStockDefault(),
  ])
  return {
    product: withLowStockAt(product, defaultLevel),
    categoryName: category?.name ?? 'Uncategorised',
  }
}