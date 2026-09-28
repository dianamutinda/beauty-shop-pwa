
import { useNavigate } from 'react-router-dom'

export default function Account() {
  const navigate = useNavigate()

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
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-sm font-semibold text-pink-700">
            W
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Worker
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              Shop account
            </p>
          </div>
        </div>
      </section>

      {/* Account options */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          Account
        </p>

        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                My profile
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                Profile details
              </p>
            </div>

            <span className="text-gray-300">
              ›
            </span>
          </button>

          <div className="mx-4 border-t border-pink-50" />

          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                Shop information
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                Shop details and information
              </p>
            </div>

            <span className="text-gray-300">
              ›
            </span>
          </button>
        </div>
      </section>

      {/* App */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          App
        </p>

        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                Settings
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                App preferences
              </p>
            </div>

            <span className="text-gray-300">
              ›
            </span>
          </button>

          <div className="mx-4 border-t border-pink-50" />

          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                Help
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                Get help using the shop app
              </p>
            </div>

            <span className="text-gray-300">
              ›
            </span>
          </button>

          <div className="mx-4 border-t border-pink-50" />

          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                About
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                App information
              </p>
            </div>

            <span className="text-gray-300">
              ›
            </span>
          </button>
        </div>
      </section>

      {/* Placeholder */}
      <div className="rounded-2xl bg-pink-50 px-5 py-4">
        <p className="text-sm font-medium text-pink-800">
          More account features coming later
        </p>

        <p className="mt-1 text-xs leading-5 text-pink-600">
          Profile management, shop settings, and other account
          features will be connected here once the backend is ready.
        </p>
      </div>

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full rounded-2xl border border-pink-200 bg-white py-3.5 text-sm font-medium text-gray-700"
      >
        Back Home
      </button>
    </div>
  )
}
