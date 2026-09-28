import { useState } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  House,
  Receipt,
  ChartNoAxesColumnIncreasing,
  UserRound,
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  Settings,
  Menu,
} from 'lucide-react'

import { useRole } from '../RoleContext'
import { getShop } from '../db/shop'
import { hasPin } from '../db/settings'
import PinDialog from './PinDialog'

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
    to: '/owner/sales',
    label: 'Sales',
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
  const { role, switchRole } = useRole()
  const navigate = useNavigate()
  const location = useLocation()

  const shop = useLiveQuery(() => getShop(), [])

  const [askingPin, setAskingPin] = useState(false)

  function go(next) {
    switchRole(next)
    navigate(next === 'owner' ? '/owner' : '/')
  }

  async function toggleRole() {
    if (role === 'owner') {
      go('worker')
    } else if (await hasPin()) {
      setAskingPin(true)
    } else {
      go('owner')
    }
  }

  /*
   * These are focused workflows.
   * The reference design removes the bottom navigation
   * while the worker is inside a sale or viewing a product.
   */
  const hideWorkerNav =
    role === 'worker' &&
    (
      location.pathname === '/sale' ||
      location.pathname.startsWith('/product/')
    )

  const navItems =
    role === 'owner'
      ? OWNER_NAV
      : WORKER_NAV

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

        <button
          type="button"
          onClick={toggleRole}
          className="shrink-0 rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs font-medium text-pink-700"
        >
          {role === 'owner' ? 'Owner' : 'Worker'}
        </button>
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
          <div className="grid grid-cols-4">
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
                        className={`text-[10px] ${
                          isActive
                            ? 'font-medium text-pink-600'
                            : 'text-gray-400'
                        }`}
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

      {/* PIN dialog */}
      {askingPin && (
        <PinDialog
          onCancel={() => setAskingPin(false)}
          onSuccess={() => {
            setAskingPin(false)
            go('owner')
          }}
        />
      )}
    </div>
  )
}