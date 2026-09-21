import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRole } from '../RoleContext'
import { getShop } from '../db/shop'
import { hasPin } from '../db/settings'
import PinDialog from './PinDialog'

const NAV = {
  worker: [
    { to: '/', label: 'Home', end: true },
    { to: '/search', label: 'Search' },
  ],
  owner: [
    { to: '/owner', label: 'Dashboard', end: true },
    { to: '/owner/products', label: 'Products' },
    { to: '/owner/stock', label: 'Stock' },
    { to: '/owner/categories', label: 'Categories' },
    { to: '/owner/settings', label: 'Settings' },
  ],
}

export default function Layout() {
  const { role, switchRole } = useRole()
  const navigate = useNavigate()
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

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-pink-50">
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <h1 className="truncate text-lg font-semibold text-pink-700">{shop?.name ?? ''}</h1>
        <button
          onClick={toggleRole}
          className="rounded-full border border-pink-300 px-3 py-1 text-sm text-pink-700"
        >
          {role === 'owner' ? 'Owner' : 'Worker'}
        </button>
      </header>

      <main className="flex-1 p-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 flex w-full max-w-md -translate-x-1/2 border-t border-pink-100 bg-white">
        {NAV[role].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-xs ${
                isActive ? 'font-semibold text-pink-600' : 'text-gray-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

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