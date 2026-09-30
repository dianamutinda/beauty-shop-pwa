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
<header className="border-b border-pink-100 bg-white">
  <div className="flex items-center justify-between px-4 py-3.5">
    <div className="flex min-w-0 items-center gap-3">
      {/* Shop mark */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100">
        <span className="text-sm font-semibold text-pink-600">
          {shop?.name?.charAt(0)?.toUpperCase() || 'B'}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-gray-900">
            {shop?.name ?? 'Beauty Shop'}
          </h1>

          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        </div>

        <p className="mt-0.5 text-[11px] text-gray-400">
          {role === 'owner' ? 'Owner' : 'Worker'}
        </p>
      </div>
    </div>

    {/* Account shortcut */}
    <NavLink
      to="/account"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-pink-600 transition active:scale-95"
      aria-label="Account"
    >
      <UserRound size={17} strokeWidth={1.8} />
    </NavLink>
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