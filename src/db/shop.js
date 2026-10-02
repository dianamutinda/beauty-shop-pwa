import { db } from './index'
import { supabase } from './supabase'

export async function cacheShopForUser(userId) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('shop_id')
    .eq('id', userId)
    .maybeSingle()
  if (profileError) throw profileError
  if (!profile) throw new Error('No profile row found (or RLS blocked it) for this user.')
  if (!profile.shop_id) throw new Error('Your profile has no shop_id set.')

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('id', profile.shop_id)
    .maybeSingle()
  if (shopError) throw shopError
  if (!shop) throw new Error('Shop row not found (or RLS blocked it).')

  await db.transaction('rw', db.shops, db.settings, async () => {
    await db.shops.put({ id: shop.id, name: shop.name, createdAt: shop.created_at })
    await db.settings.put({ key: 'shopId', value: shop.id })
    await db.settings.put({ key: 'cachedUserId', value: userId })
  })
}

export async function ensureShopForUser(userId) {
  const [cachedUser, cachedShop] = await Promise.all([
    db.settings.get('cachedUserId'),
    db.settings.get('shopId'),
  ])

  if (cachedUser?.value === userId && cachedShop) {
    if (navigator.onLine) cacheShopForUser(userId).catch(() => {})
    return
  }

  if (!navigator.onLine) {
    throw new Error('Connect to the internet to sign in on this phone for the first time.')
  }
  await cacheShopForUser(userId)
}

export async function getShopId() {
  const setting = await db.settings.get('shopId')
  if (!setting) throw new Error('No shop loaded yet. Sign in first.')
  return setting.value
}

export const ensureShop = getShopId

export async function getShop() {
  const id = await getShopId()
  return db.shops.get(id)
}

export async function renameShop(name) {
  const clean = name.trim()
  if (!clean) throw new Error('Shop name is required')
  await db.shops.update(await getShopId(), { name: clean })
}