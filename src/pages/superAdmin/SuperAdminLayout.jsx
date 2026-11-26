import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    to: '/super-admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/super-admin/shops',
    label: 'Shops',
    icon: Store,
  },
]

export default function SuperAdminLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <div>
          <p className="text-sm font-semibold">BeautyShop Admin</p>
          <p className="text-[11px] text-zinc-400">Platform</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/20"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />

          <aside className="relative h-full w-72 max-w-[85%] bg-white p-5 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">BeautyShop Admin</p>
                <p className="text-xs text-zinc-400">Platform management</p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                        isActive
                          ? 'bg-pink-50 font-medium text-pink-700'
                          : 'text-zinc-600 hover:bg-zinc-50'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-zinc-100 px-6">
          <div>
            <p className="text-sm font-semibold">BeautyShop Admin</p>
            <p className="text-xs text-zinc-400">Platform management</p>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    isActive
                      ? 'bg-pink-50 font-medium text-pink-700'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}