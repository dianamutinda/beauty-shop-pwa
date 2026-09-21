import { db } from './index'

const DEFAULT_LOW_STOCK = 5
const PIN_KEY = 'ownerPin'

export async function getLowStockDefault() {
  const entry = await db.settings.get('lowStockDefault')
  return entry?.value ?? DEFAULT_LOW_STOCK
}

export async function setLowStockDefault(value) {
  const n = Number(value)
  if (value === '' || !Number.isInteger(n) || n < 0) {
    throw new Error('Enter a whole number, 0 or more')
  }
  await db.settings.put({ key: 'lowStockDefault', value: n })
}

async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(`${salt}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hasPin() {
  return Boolean(await db.settings.get(PIN_KEY))
}

async function assertCurrentPin(currentPin) {
  // checkPin returns true when no PIN is set, so first-time setup needs nothing
  if (!(await checkPin(currentPin))) throw new Error('Current PIN is wrong.')
}

export async function setPin(pin, currentPin = '') {
  await assertCurrentPin(currentPin)
  if (!/^\d{4,6}$/.test(pin)) throw new Error('PIN must be 4 to 6 digits')
  const salt = crypto.randomUUID()
  await db.settings.put({ key: PIN_KEY, value: { salt, hash: await hashPin(pin, salt) } })
}

export async function removePin(currentPin = '') {
  await assertCurrentPin(currentPin)
  await db.settings.delete(PIN_KEY)
}

export async function checkPin(pin) {
  const entry = await db.settings.get(PIN_KEY)
  if (!entry) return true
  return (await hashPin(pin, entry.value.salt)) === entry.value.hash
}

export async function getLastBackupAt() {
  const entry = await db.settings.get('lastBackupAt')
  return entry?.value ?? null
}