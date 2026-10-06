
import { db } from './index'
import { getShopId } from './shop'
import { enqueue } from './syncQueue'

// Who is signed in. AuthContext sets this, because supabase.auth
// can't be awaited inside a Dexie transaction.
let currentUserId = 'local'

export function setActivityUser(id) {
  currentUserId = id ?? 'local'
}

// Plain write plus queue entry.
// The calling transaction must include db.activity and db.syncQueue.
export async function addActivity(
  shopId,
  action,
  details = {},
  userId = currentUserId
) {
  const id = crypto.randomUUID()

  await db.activity.add({
    id,
    shopId,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    synced: 0,
  })

  await enqueue('activity', id)

  return id
}

// Convenience version for actions that are not
// already inside a database transaction.
export async function logActivity(
  action,
  details = {},
  userId = currentUserId
) {
  const shopId = await getShopId()

  await db.transaction(
    'rw',
    db.activity,
    db.syncQueue,
    async () => {
      await addActivity(shopId, action, details, userId)
    }
  )
}

// Newest first, each row labelled with the member's name.
// Names come from the shopMembers list cached by pullShopData,
// so this works offline.
export async function listActivity({ limit = 50 } = {}) {
  const shopId = await getShopId()

  const rows = await db.activity
    .where('shopId')
    .equals(shopId)
    .toArray()

  const members =
    (await db.settings.get('shopMembers'))?.value ?? []

  const nameById = new Map(
    members.map((m) => [m.id, m.display_name || m.role])
  )

  return rows
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
    .map((r) => ({
      ...r,
      userName: nameById.get(r.userId) ?? 'Unknown user',
    }))
}

const money = (n) =>
  `KSh ${Number(n ?? 0).toLocaleString('en-KE')}`

export function describeActivity(row) {
  const who = row.userName ?? 'Someone'
  const d = row.details ?? {}

  switch (row.action) {
    case 'sale.recorded': {
      const count = d.itemCount ?? 0
      const items = `${count} item${count === 1 ? '' : 's'}`
      const pay = d.paymentMethod
        ? ` (${d.paymentMethod})`
        : ''

      return `${who} recorded a sale of ${money(d.total)}, ${items}${pay}`
    }

    case 'sale.voided':
      return `${who} voided a sale of ${money(d.total)}`

    case 'stock.restock':
      return `${who} restocked ${d.productName} by ${d.quantity} (now ${d.newStock})`

    case 'stock.adjustment': {
      const sign = d.quantity > 0 ? '+' : ''

      return `${who} adjusted ${d.productName} by ${sign}${d.quantity} (now ${d.newStock})`
    }

    case 'stock.counted':
      return `${who} counted stock and adjusted ${d.adjusted} product${d.adjusted === 1 ? '' : 's'}`

    case 'product.added': {
      const stock =
        d.openingStock > 0
          ? `, opening stock ${d.openingStock}`
          : ''

      return `${who} added ${d.productName} (${d.sku}) at ${money(d.sellingPrice)}${stock}`
    }

    case 'product.updated': {
      const f = d.fields ?? []

      if (f.length === 1 && f[0] === 'sellingPrice') {
        return `${who} changed the price of ${d.productName} from ${money(d.sellingPrice.from)} to ${money(d.sellingPrice.to)}`
      }

      if (f.length === 1 && f[0] === 'name') {
        return `${who} renamed ${d.oldName} to ${d.productName}`
      }

      return `${who} edited ${d.productName} (${f.join(', ')})`
    }

    case 'category.added':
      return `${who} added the category ${d.categoryName}`

    case 'category.renamed':
      return `${who} renamed the category ${d.oldName} to ${d.categoryName}`

    case 'category.deleted':
      return `${who} deleted the category ${d.categoryName}`

    default:
      return `${who}: ${row.action}`
  }
}

export function getActivityUser() {
  return currentUserId
}

