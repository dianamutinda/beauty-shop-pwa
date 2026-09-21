import Dexie from 'dexie'

export const db = new Dexie('ShopDB')

db.version(1).stores({
  settings: 'key',
  shops: 'id',
  categories: 'id, shopId, &[shopId+name], synced',
  products: 'id, shopId, &[shopId+sku], name, categoryId, stock, synced',
  stockMovements: 'id, shopId, productId, type, timestamp, synced',
})