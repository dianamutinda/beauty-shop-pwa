import { db } from './index'

const DEFAULT_LOW_STOCK = 5

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