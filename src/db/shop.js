import { db } from './index'

async function loadOrCreateShopId() {
  const setting = await db.settings.get('shopId')
  if (setting) return setting.value

  const id = crypto.randomUUID()
  await db.transaction('rw', db.shops, db.settings, async () => {
    await db.shops.add({
      id,
      name: 'My Shop',
      createdAt: new Date().toISOString(),
    })
    await db.settings.put({ key: 'shopId', value: id })
  })
  return id
}

let shopIdPromise

export function getShopId() {
  if (!shopIdPromise) shopIdPromise = loadOrCreateShopId()
  return shopIdPromise
}

export function ensureShop() {
  return getShopId()
}

export async function getShop() {
  const id = await getShopId()
  return db.shops.get(id)
}

export async function renameShop(name) {
  const clean = name.trim()
  if (!clean) throw new Error('Shop name is required')
  await db.shops.update(await getShopId(), { name: clean })
}