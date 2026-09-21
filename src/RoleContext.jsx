import { createContext, useContext, useState } from 'react'

const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return sessionStorage.getItem('role') === 'owner' ? 'owner' : 'worker'
    } catch {
      return 'worker'
    }
  })

  function switchRole(next) {
    setRole(next)
    try {
      sessionStorage.setItem('role', next)
    } catch {
      /* storage unavailable, the role just won't persist */
    }
  }

  return <RoleContext.Provider value={{ role, switchRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used inside RoleProvider')
  return ctx
}