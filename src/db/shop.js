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