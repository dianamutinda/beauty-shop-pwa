
import { useState } from 'react'
import { Plus, Search, Store } from 'lucide-react'

const SAMPLE_SHOPS = [
  {
    id: 1,
    name: 'Diana Beauty Shop',
    owner: 'Diana Jackson',
    email: 'diana@example.com',
    status: 'Active',
    createdAt: 'Sep 28, 2026',
  },
  {
    id: 2,
    name: 'Glow Beauty Store',
    owner: 'Mary Wanjiku',
    email: 'mary@example.com',
    status: 'Active',
    createdAt: 'Sep 25, 2026',
  },
  {
    id: 3,
    name: 'Bella Cosmetics',
    owner: 'Ann Mwangi',
    email: 'ann@example.com',
    status: 'Inactive',
    createdAt: 'Sep 20, 2026',
  },
]

export default function Shops() {
  const [search, setSearch] = useState('')

  const filteredShops = SAMPLE_SHOPS.filter((shop) => {
    const query = search.toLowerCase().trim()

    if (!query) return true

    return (
      shop.name.toLowerCase().includes(query) ||
      shop.owner.toLowerCase().includes(query) ||
      shop.email.toLowerCase().includes(query)
    )
  })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            Shops
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage shops registered on the platform.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-pink-500 px-4 text-sm font-medium text-white transition hover:bg-pink-600 active:scale-[0.98]"
        >
          <Plus size={17} />
          Add shop
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search shops..."
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-zinc-200 bg-zinc-50/70">
              <tr>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Shop
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Owner
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Created
                </th>

                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filteredShops.map((shop) => (
                <tr
                  key={shop.id}
                  className="transition hover:bg-zinc-50/60"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                        <Store size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {shop.name}
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          {shop.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-700">
                    {shop.owner}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={shop.status} />
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-500">
                    {shop.createdAt}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-zinc-600 transition hover:text-pink-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filteredShops.map((shop) => (
          <div
            key={shop.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                  <Store size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {shop.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {shop.owner}
                  </p>
                </div>
              </div>

              <StatusBadge status={shop.status} />
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">Owner email</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {shop.email}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400">Created</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {shop.createdAt}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-pink-200 hover:text-pink-600"
              >
                View shop
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredShops.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <Store className="mx-auto text-zinc-300" size={28} />

          <h2 className="mt-3 text-sm font-medium text-zinc-900">
            No shops found
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Try a different search term.
          </p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const active = status === 'Active'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? 'bg-green-50 text-green-700'
          : 'bg-zinc-100 text-zinc-500'
      }`}
    >
      {status}
    </span>
  )
}
