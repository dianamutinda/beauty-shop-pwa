import { db } from './index'
import { getShopId } from './shop'

// Plain write.
// Safe inside a transaction that includes db.activity.
export function addActivity(
  shopId,
  action,
  details = {},
  userId = 'local'
) {
  return db.activity.add({
    id: crypto.randomUUID(),
    shopId,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    synced: 0,
  })
}

// Convenience version for actions that are not
// already inside a database transaction.
export async function logActivity(
  action,
  details = {},
  userId = 'local'
) {
  const shopId = await getShopId()

  await addActivity(
    shopId,
    action,
    details,
    userId
  )
}

export async function listActivity({ limit = 50 } = {}) {
  const shopId = await getShopId()

  return db.activity
    .where('shopId')
    .equals(shopId)
    .reverse()
    .sortBy('timestamp')
    .then((rows) => rows.slice(0, limit))
}