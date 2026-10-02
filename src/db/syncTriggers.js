import { supabase } from './supabase'
import { syncPendingChanges } from './sync'

export function startSyncTriggers() {
  const run = () => {
    syncPendingChanges().catch((err) => console.error('Sync error', err))
  }

  run()
  window.addEventListener('online', run)
  const timer = setInterval(run, 60_000)

  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') setTimeout(run, 0)
  })

  return () => {
    window.removeEventListener('online', run)
    clearInterval(timer)
    data.subscription.unsubscribe()
  }
}