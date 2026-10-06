import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../db/supabase'
import { ensureShopForUser } from '../db/shop'
import { saveIdentity, loadIdentity, clearIdentity } from '../db/identity'
import { startSyncTriggers } from '../db/syncTriggers'
import { syncPendingChanges } from '../db/sync'
import { setActivityUser } from '../db/activity'
import {
  getDataOwner,
  setDataOwner,
  getUnsyncedDetails,
  countUnsynced,
  wipeLocalData,
} from '../db/accountSwitch'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function syncIdentity(authUser) {
    await ensureShopForUser(authUser.id)

    const { data: fresh, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) throw error

    if (fresh.active === false) {
      setActivityUser(null)
      await clearIdentity()
      await supabase.auth.signOut({ scope: 'local' })
      return
    }

    // Check which account currently owns the local Dexie data.
    const owner = await getDataOwner()

    const changed =
      owner &&
      (owner.userId !== fresh.id || owner.shopId !== fresh.shop_id)

    if (changed) {
      // Never allow another account to inherit unsynced changes.
      const { queue, orphans } = await getUnsyncedDetails()

      if (queue.length + orphans.length > 0) {
        console.table(
          queue.map((q) => ({
            table: q.table,
            recordId: q.recordId,
            op: q.op,
            lastError: q.lastError,
          }))
        )
        console.table(
          orphans.map((m) => ({
            id: m.id,
            type: m.type,
            productId: m.productId,
            timestamp: m.timestamp,
          }))
        )

        await supabase.auth.signOut({ scope: 'local' })

        throw new Error(
          `Unsynced on this phone: ${queue.length} queued ` +
            `(${queue.filter((q) => q.lastError).length} failed), ` +
            `${orphans.length} never queued. ` +
            `Sign back in with the original account first.`
        )
      }

      // Safe to replace the local dataset because nothing is waiting
      // to be synced to the previous account/shop.
      await wipeLocalData()
    }

    // Mark this account/shop as the owner of the local Dexie data.
    await setDataOwner(fresh.id, fresh.shop_id)

    const identity = {
      ...fresh,
      email: authUser.email,
    }

    await saveIdentity(identity)
    setProfile(identity)
    setActivityUser(identity.id)
  }

  useEffect(() => {
    let mounted = true

    async function start() {
      const cached = await loadIdentity()

      if (!mounted) return

      if (cached) {
        setProfile(cached)
        // Offline starts never reach syncIdentity, so the cached
        // identity is the only source of the user id.
        setActivityUser(cached.id)
        setLoading(false)
      }

      const { data } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(data.session)

      if (data.session) {
        const refresh = syncIdentity(data.session.user)

        if (cached) {
          refresh.catch(() => {})
        } else {
          await refresh.catch(() => {})
        }
      }

      if (mounted) setLoading(false)
    }

    start()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT') {
          setSession(null)

          if (navigator.onLine) {
            setProfile(null)
            setActivityUser(null)
            clearIdentity()
          }

          return
        }

        setSession(newSession)
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // Do not start sync just because a session exists.
  // syncIdentity must first verify the account/shop and establish
  // the correct local data owner.
  useEffect(() => {
    if (!session || !profile || profile.id !== session.user.id) return

    return startSyncTriggers()
  }, [session?.user?.id, profile?.id])

  function friendlyError(err) {
    const networky =
      err?.name === 'AuthRetryableFetchError' ||
      /failed to fetch|network/i.test(err?.message ?? '')

    return networky
      ? new Error(
          'Could not reach the server. Check your connection and try again.'
        )
      : err
  }

  async function signIn(email, password) {
    if (!navigator.onLine) {
      throw new Error('No internet connection. Signing in needs a connection.')
    }

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (result.error) {
      throw friendlyError(result.error)
    }

    try {
      await syncIdentity(result.data.user)
    } catch (err) {
      // syncIdentity may already have signed the user out when
      // an account switch with unsynced data is detected.
      setActivityUser(null)
      await supabase.auth.signOut({ scope: 'local' })
      throw friendlyError(err)
    }
  }

  async function signOut() {
    // Try to push pending changes before signing out.
    if (navigator.onLine) {
      await syncPendingChanges()
    }

    // If anything remains, warn the user before clearing identity.
    if ((await countUnsynced()) > 0) {
      const ok = window.confirm(
        'Some changes have not synced yet. They stay on this phone and will sync when you sign back in with this account. Sign out anyway?'
      )

      if (!ok) return
    }

    setActivityUser(null)
    await clearIdentity()

    const { error } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (error) throw error
  }

  const value = {
    role: profile?.role ?? null,

    user: profile
      ? session?.user ?? {
          id: profile.id,
          email: profile.email,
        }
      : null,

    profile,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useRole must be used inside AuthProvider')
  }

  return ctx
}