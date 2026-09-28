
export default function Account() {
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
            JW
          </div>

          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900">
              Jane Wanjiku
            </p>

            <p className="mt-0.5 text-sm text-gray-500">
              Sales worker
            </p>
          </div>
        </div>
      </section>

      {/* My account */}
      <section className="space-y-2">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          My account
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
                View and update your details
              </p>
            </div>

            <span className="text-lg text-gray-300">
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
                Change PIN
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                Update your account PIN
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

        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                Shop information
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                View shop details
              </p>
            </div>

            <span className="text-lg text-gray-300">
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

            <span className="text-lg text-gray-300">
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

            <span className="text-lg text-gray-300">
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

            <span className="text-lg text-gray-300">
              ›
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}
