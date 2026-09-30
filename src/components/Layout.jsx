import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  House,
  Search,
  Receipt,
  ChartNoAxesColumnIncreasing,
  UserRound,
  LayoutDashboard,
  Package,
  Menu,
} from 'lucide-react'

import { useRole } from '../auth/AuthContext'
import { getShop } from '../db/shop'
import { hasPinSet } from '../auth/pin'
import { useLockTimer } from '../auth/useLockTimer'
import { LockScreen } from '../auth/LockScreen'

const WORKER_NAV = [
  {
    to: '/',
    label: 'Home',
    icon: House,
    end: true,
  },
  {
    to: '/sales',
    label: 'Sales',
    icon: Receipt,
  },
  {
    to: '/end-of-day',
    label: 'End of Day',
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    to: '/account',
    label: 'Account',
    icon: UserRound,
  },
]

const OWNER_NAV = [
  {
    to: '/owner',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/search',
    label: 'Search',
    icon: Search,
  },
  {
    to: '/sale',
    label: 'Record Sale',
    icon: Receipt,
  },
  {
    to: '/owner/products',
    label: 'Products',
    icon: Package,
  },
  {
    to: '/owner/more',
    label: 'More',
    icon: Menu,
  },
]

export default function Layout() {
  const { role, user } = useRole()
  const location = useLocation()

  const shop = useLiveQuery(() => getShop(), [])

  const [pinReady, setPinReady] = useState(false)
  const { locked, unlock } = useLockTimer()

  useEffect(() => {
    if (user) {
      hasPinSet(user.id).then(setPinReady)
    }
  }, [user])

  const hideWorkerNav =
    role === 'worker' &&
    (
      location.pathname === '/sale' ||
      location.pathname.startsWith('/product/')
    )

  const navItems = role === 'owner'
    ? OWNER_NAV
    : WORKER_NAV

  if (pinReady && locked) {
    return (
      <LockScreen
        userId={user.id}
        onUnlock={unlock}
      />
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-pink-50">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-pink-100 bg-white px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-gray-900">
            {shop?.name ?? 'Beauty Shop'}
          </h1>

          <p className="text-[11px] text-gray-400">
            {role === 'owner'
              ? 'Owner Dashboard'
              : 'Worker Dashboard'}
          </p>
        </div>
      </header>

      {/* Page */}
      <main
        className={`flex-1 p-4 ${
          hideWorkerNav ? 'pb-6' : 'pb-24'
        }`}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!hideWorkerNav && (
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-pink-100 bg-white">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="flex flex-col items-center justify-center gap-1 py-2.5"
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className={
                          isActive
                            ? 'text-pink-600'
                            : 'text-gray-400'
                        }
                      />

                      <span
                        className={
                          `text-[10px] ${
                            isActive
                              ? 'font-medium text-pink-600'
                              : 'text-gray-400'
                          }`
                        }
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}