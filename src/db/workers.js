import { db } from './index'
import { getShopId } from './shop'
import { addActivity } from './activity'

async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(`${salt}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function validatePin(pin) {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN must be 4 to 6 digits')
  }
}

async function assertPhoneFree(phone, exceptId = null) {
  const shopId = await getShopId()

  const existing = await db.workers
    .where('shopId')
    .equals(shopId)
    .filter(
      (worker) =>
        worker.id !== exceptId &&
        worker.phone === phone
    )
    .first()

  if (existing) {
    throw new Error('A worker with this phone already exists')
  }
}

export async function addWorker({
  name,
  phone,
  pin,
}) {
  const cleanName = name.trim()
  const cleanPhone = phone.trim()

  if (!cleanName) {
    throw new Error('Worker name is required')
  }

  if (!cleanPhone) {
    throw new Error('Worker phone is required')
  }

  validatePin(pin)
  await assertPhoneFree(cleanPhone)

  const shopId = await getShopId()
  const id = crypto.randomUUID()
  const salt = crypto.randomUUID()

  const worker = {
    id,
    shopId,
    name: cleanName,
    phone: cleanPhone,
    pin: {
      salt,
      hash: await hashPin(pin, salt),
    },
    role: 'worker',
    active: true,
    createdAt: new Date().toISOString(),
    synced: 0,
  }

  await db.transaction(
    'rw',
    db.workers,
    db.activity,
    async () => {
      await db.workers.add(worker)

      await addActivity(
        shopId,
        'worker.added',
        {
          workerId: id,
          name: cleanName,
        }
      )
    }
  )

  return {
    ...worker,
    pin: undefined,
  }
}

export async function listWorkers() {
  const shopId = await getShopId()

  return db.workers
    .where('shopId')
    .equals(shopId)
    .sortBy('name')
}

export async function getWorker(id) {
  const worker = await db.workers.get(id)

  if (!worker) return null

  const shopId = await getShopId()

  if (worker.shopId !== shopId) return null

  return worker
}

export async function updateWorker(
  id,
  changes
) {
  const worker = await getWorker(id)

  if (!worker) {
    throw new Error('Worker not found')
  }

  const updates = {}

  if ('name' in changes) {
    const name = changes.name.trim()

    if (!name) {
      throw new Error('Worker name is required')
    }

    updates.name = name
  }

  if ('phone' in changes) {
    const phone = changes.phone.trim()

    if (!phone) {
      throw new Error('Worker phone is required')
    }

    await assertPhoneFree(phone, id)
    updates.phone = phone
  }

  if ('pin' in changes) {
    validatePin(changes.pin)

    const salt = crypto.randomUUID()

    updates.pin = {
      salt,
      hash: await hashPin(
        changes.pin,
        salt
      ),
    }
  }

  if ('active' in changes) {
    updates.active = Boolean(changes.active)
  }

  if (Object.keys(updates).length === 0) {
    return worker
  }

  updates.synced = 0

  await db.transaction(
    'rw',
    db.workers,
    db.activity,
    async () => {
      await db.workers.update(id, updates)

      await addActivity(
        worker.shopId,
        'worker.updated',
        {
          workerId: id,
          changes: Object.keys(updates),
        }
      )
    }
  )

  return {
    ...worker,
    ...updates,
    pin: undefined,
  }
}

export async function deactivateWorker(id) {
  return updateWorker(id, {
    active: false,
  })
}
export async function activateWorker(id) {
  return updateWorker(id, {
    active: true,
  })
}