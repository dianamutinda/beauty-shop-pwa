import { db } from './index'

const KEY = 'dataOwner'

export async function getDataOwner() {
  const row = await db.settings.get(KEY)
  return row?.value ?? null
}

export async function setDataOwner(userId, shopId) {
  await db.settings.put({ key: KEY, value: { userId, shopId } })
}

// Everything on this phone that hasn't reached the server:
// queued changes, plus unsynced movements that nothing is
// queued for (these can never sync on their own).
export async function getUnsyncedDetails() {
  const queue = await db.syncQueue.toArray()
  const movements = await db.stockMovements
    .filter((m) => m.synced === 0)
    .toArray()

  // Sales and voids are queued under their saleId,
  // other movements under their own id.
  const queuedIds = new Set(queue.map((q) => q.recordId))
  const orphans = movements.filter(
    (m) => !queuedIds.has(m.id) && !queuedIds.has(m.saleId)
  )

  return { queue, orphans }
}

export async function countUnsynced() {
  const { queue, orphans } = await getUnsyncedDetails()
  return queue.length + orphans.length
}

export async function wipeLocalData() {
  const tables = db.tables.filter((t) => t.name !== 'settings')
  await db.transaction('rw', tables, async () => {
    for (const t of tables) await t.clear()
  })
}