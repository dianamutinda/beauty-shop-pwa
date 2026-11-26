import { Store, CheckCircle2, XCircle } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'

export default function SuperAdminDashboard() {
  const shops = useLiveQuery(
    () => db.shops.toArray(),
    []
  )

  if (!shops) {
    return <div className="text-sm text-zinc-500">Loading...</div>
  }

  const activeShops = shops.filter((shop) => shop.active !== false)
  const inactiveShops = shops.filter((shop) => shop.active === false)

  const cards = [
    {
      label: 'Total shops',
      value: shops.length,
      icon: Store,
    },
    {
      label: 'Active',
      value: activeShops.length,
      icon: CheckCircle2,
    },
    {
      label: 'Inactive',
      value: inactiveShops.length,
      icon: XCircle,
    },
  ]

  return (
    <div className="space-y-6">

      <div>
        <p className="text-sm font-medium text-pink-600">
          Platform
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage the shops using your platform.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                  {card.label}
                </p>

                <Icon
                  size={18}
                  className="text-zinc-400"
                />
              </div>

              <p className="mt-4 text-2xl font-semibold">
                {card.value}
              </p>
            </div>
          )
        })}
      </div>

    </div>
  )
}