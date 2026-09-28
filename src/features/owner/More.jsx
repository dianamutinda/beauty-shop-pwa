import { Link } from 'react-router-dom'
import {
  UsersRound,
  Activity,
  Boxes,
  ClipboardCheck,
  Settings,
  Store,
  ChevronRight,
} from 'lucide-react'

const ITEMS = [
  {
    to: '/owner/workers',
    label: 'Workers',
    description: 'Manage workers and their accounts',
    icon: UsersRound,
  },
  {
    to: '/owner/activity',
    label: 'Activity',
    description: 'See recent activity in your shop',
    icon: Activity,
  },
  {
    to: '/owner/stock',
    label: 'Stock',
    description: 'Update and review stock levels',
    icon: Boxes,
  },
  {
    to: '/end-of-day',
    label: 'End of Day',
    description: 'Review the day and close out sales',
    icon: ClipboardCheck,
  },
]

const COMING_SOON = [
  {
    label: 'Shop Information',
    description: 'Manage your shop details',
    icon: Store,
  },
  {
    label: 'Settings',
    description: 'Manage app settings',
    icon: Settings,
  },
]

function MenuItem({ item }) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      className="flex items-center gap-3 rounded-xl border border-pink-100 bg-white p-4 transition-colors hover:bg-pink-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">
          {item.label}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {item.description}
        </p>
      </div>

      <ChevronRight
        size={17}
        strokeWidth={1.8}
        className="shrink-0 text-gray-300"
      />
    </Link>
  )
}

function ComingSoonItem({ item }) {
  const Icon = item.icon

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600">
          {item.label}
        </p>

        <p className="mt-0.5 text-xs text-gray-400">
          {item.description}
        </p>
      </div>

      <span className="shrink-0 text-[10px] font-medium text-gray-400">
        Soon
      </span>
    </div>
  )
}

export default function More() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pink-700">
          More
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage other parts of your shop.
        </p>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Shop Management
        </h3>

        <div className="space-y-3">
          {ITEMS.map((item) => (
            <MenuItem
              key={item.to}
              item={item}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Shop Setup
        </h3>

        <div className="space-y-3">
          {COMING_SOON.map((item) => (
            <ComingSoonItem
              key={item.label}
              item={item}
            />
          ))}
        </div>
      </section>
    </div>
  )
}