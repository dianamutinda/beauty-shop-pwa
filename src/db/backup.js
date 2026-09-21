import { db } from './index'
import { listCategories, listProducts } from './products'

const FORMAT = 'shop-backup'
const VERSION = 1

// Settings that belong to this device and never travel in a backup
const DEVICE_ONLY = ['ownerPin', 'recentProducts', 'lastBackupAt']
const TABLES = ['shops', 'categories', 'products', 'stockMovements']

export async function createBackup() {
  const [shops, settings, categories, products, stockMovements] = await Promise.all([
    db.shops.toArray(),
    db.settings.toArray(),
    db.categories.toArray(),
    db.products.toArray(),
    db.stockMovements.toArray(),
  ])

  const now = new Date().toISOString()
  await db.settings.put({ key: 'lastBackupAt', value: now })

  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: now,
    data: {
      shops,
      settings: settings.filter((s) => !DEVICE_ONLY.includes(s.key)),
      categories,
      products,
      stockMovements,
    },
  }
}

function assertValidBackup(backup) {
  if (!backup || backup.format !== FORMAT) throw new Error('This is not a shop backup file.')
  if (backup.version !== VERSION) throw new Error('This backup was made by a different version of the app.')

  for (const table of [...TABLES, 'settings']) {
    if (!Array.isArray(backup.data?.[table])) throw new Error(`The backup is missing "${table}".`)
  }

  const shopSetting = backup.data.settings.find((s) => s.key === 'shopId')
  if (!shopSetting || !backup.data.shops.some((s) => s.id === shopSetting.value)) {
    throw new Error('The backup does not contain a valid shop.')
  }
}

export async function restoreBackup(backup) {
  assertValidBackup(backup)
  const { data } = backup
  const settings = data.settings.filter((s) => !DEVICE_ONLY.includes(s.key))

  await db.transaction(
    'rw',
    [db.shops, db.settings, db.categories, db.products, db.stockMovements],
    async () => {
      await db.shops.clear()
      await db.categories.clear()
      await db.products.clear()
      await db.stockMovements.clear()
      await db.settings.where('key').noneOf(['ownerPin', 'lastBackupAt']).delete()

      await db.shops.bulkAdd(data.shops)
      await db.categories.bulkAdd(data.categories)
      await db.products.bulkAdd(data.products)
      await db.stockMovements.bulkAdd(data.stockMovements)
      await db.settings.bulkPut(settings)
    }
  )
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export async function createProductsCsv() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()])
  const names = new Map(categories.map((c) => [c.id, c.name]))

  const header = ['Name', 'SKU', 'Category', 'Selling price', 'Buying price', 'Stock']
  const rows = products.map((p) => [
    p.name,
    p.sku,
    names.get(p.categoryId) ?? '',
    p.sellingPrice,
    p.buyingPrice,
    p.stock,
  ])

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}