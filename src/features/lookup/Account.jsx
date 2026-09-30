import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { getShop } from '../../db/shop'
import { useRole } from '../../auth/AuthContext'
import { hasPinSet } from '../../auth/pin'

function getInitials(name, email) {
  const value = name?.trim() || email?.trim() || 'User'

  const parts = value.split(/\s+/)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return value.slice(0, 2).toUpperCase()
}

function formatRole(role) {
  if (role === 'owner') return 'Owner'
  if (role === 'worker') return 'Sales worker'
  return 'User'
}

export default function Account() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useRole()

  const shop = useLiveQuery(() => getShop(), [])

  const pinSet = useLiveQuery(
    () => (user ? hasPinSet(user.id) : false),
    [user?.id]
  )

  const displayName =
    profile?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    'User'

  const email = user?.email || 'No email available'

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Unable to sign out:', error)
    }
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Account
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Your account and app settings
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border border-pink-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-50 text-sm font-semibold text-pink-700">
            {getInitials(profile?.display_name, user?.email)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">
              {displayName}
            </p>

            <p className="mt-0.5 truncate text-sm text-gray-500">
              {formatRole(profile?.role)}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-pink-50 pt-4">
          <div>
            <p className="text-xs text-gray-400">
              Email
            </p>

            <p className="mt-0.5 break-all text-sm text-gray-800">
              {email}
            </p>
          </div>

          {profile?.phone && (
            <div>
              <p className="text-xs text-gray-400">
                Phone
              </p>

              <p className="mt-0.5 text-sm text-gray-800">
                {profile.phone}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* App lock */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          App lock
        </p>

        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
          <button
            type="button"
            onClick={() => navigate('/set-pin')}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                {pinSet ? 'Change PIN' : 'Set PIN'}
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                {pinSet
                  ? 'Update the PIN used to unlock this device'
                  : 'Protect the app on this device'}
              </p>
            </div>

            <span className="text-lg text-gray-300">
              ›
            </span>
          </button>
        </div>
      </section>

      {/* Shop */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          Shop
        </p>

        <div className="rounded-2xl border border-pink-100 bg-white p-4">
          <p className="text-sm font-medium text-gray-800">
            {shop?.name || 'Beauty Shop'}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Your current shop
          </p>
        </div>
      </section>

      {/* Account actions */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          Account
        </p>

        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-red-600">
                Sign out
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                Sign out of this account
              </p>
            </div>

            <span className="text-lg text-gray-300">
              ›
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}