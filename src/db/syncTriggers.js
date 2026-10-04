import { supabase } from './supabase'
import { syncPendingChanges, syncAll } from './sync'

const PULL_EVERY_MS = 5 * 60_000

export function startSyncTriggers() {
  let lastPull = 0

  // Push only: cheap, and safe to run often.
  const push = () => {
    syncPendingChanges().catch((err) => console.error('Sync error', err))
  }

  // Push, then pull, but not more than once per PULL_EVERY_MS
  // unless it's forced (start, sign-in).
  const full = ({ force = false } = {}) => {
    if (!force && Date.now() - lastPull < PULL_EVERY_MS) return push()
    lastPull = Date.now()
    syncAll().catch((err) => console.error('Sync error', err))
  }

  full({ force: true })

  const onOnline = () => full()
  window.addEventListener('online', onOnline)

  const timer = setInterval(() => {
    // Every minute: push. Pull only if the 5 minutes have passed.
    full()
  }, 60_000)

  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') setTimeout(() => full(), 0)
    if (event === 'TOKEN_REFRESHED') setTimeout(push, 0)
  })

  return () => {
    window.removeEventListener('online', onOnline)
    clearInterval(timer)
    data.subscription.unsubscribe()
  }
}