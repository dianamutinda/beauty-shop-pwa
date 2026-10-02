// src/db/identity.js  (new file)
import { db } from './index'

export async function saveIdentity(identity) {
  await db.settings.put({ key: 'cachedProfile', value: identity })
}

export async function loadIdentity() {
  return (await db.settings.get('cachedProfile'))?.value ?? null
}

export async function clearIdentity() {
  await db.settings.delete('cachedProfile')
}