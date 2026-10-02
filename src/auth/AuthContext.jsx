// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../db/supabase'
import { ensureShopForUser } from '../db/shop'
import { saveIdentity, loadIdentity, clearIdentity } from '../db/identity'
import { startSyncTriggers } from '../db/syncTriggers'

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
      await clearIdentity()
      await supabase.auth.signOut({ scope: 'local' })
      return
    }

    const identity = { ...fresh, email: authUser.email }
    await saveIdentity(identity)
    setProfile(identity)
  }

  useEffect(() => {
    let mounted = true

    async function start() {
      const cached = await loadIdentity()
      if (!mounted) return
      if (cached) {
        setProfile(cached)
        setLoading(false)
      }

      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)

      if (data.session) {
        const refresh = syncIdentity(data.session.user)
        if (cached) refresh.catch(() => {})
        else await refresh.catch(() => {})
      }
      if (mounted) setLoading(false)
    }
    start()

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
  setSession(null)
  if (navigator.onLine) {
    setProfile(null)
    clearIdentity()
  }
  return
}
      setSession(newSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])
  useEffect(() => {
  if (!session) return
  return startSyncTriggers()
}, [session?.user?.id])

function friendlyError(err) {
  const networky =
    err?.name === 'AuthRetryableFetchError' ||
    /failed to fetch|network/i.test(err?.message ?? '')
  return networky
    ? new Error('Could not reach the server. Check your connection and try again.')
    : err
}

async function signIn(email, password) {
  if (!navigator.onLine) {
    throw new Error('No internet connection. Signing in needs a connection.')
  }

  const result = await supabase.auth.signInWithPassword({ email, password })
  if (result.error) throw friendlyError(result.error)

  try {
    await syncIdentity(result.data.user)
  } catch (err) {
    await supabase.auth.signOut({ scope: 'local' })
    throw friendlyError(err)
  }
}

  async function signOut() {
    await clearIdentity()
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw error
  }

  const value = {
    role: profile?.role ?? null,
    user: profile
      ? session?.user ?? { id: profile.id, email: profile.email }
      : null,
    profile,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useRole() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useRole must be used inside AuthProvider')
  return ctx
}