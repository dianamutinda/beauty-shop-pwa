
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity as ActivityIcon,
  ShoppingCart,
  Package,
  Users,
  ShieldCheck,
  ClipboardList,
  Boxes,
} from 'lucide-react'

import { listActivity, describeActivity } from '../../db/activity'
import { subscribeSyncStatus } from '../../db/sync'

function formatTime(timestamp) {
  const date = new Date(timestamp)

  return date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const today = new Date()

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getCategory(activity) {
  const value = [
    activity.category,
    activity.type,
    activity.action,
    activity.entity,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/sale|payment|mpesa|checkout/.test(value)) {
    return 'Sales'
  }

  if (/stock|inventory|count|adjustment/.test(value)) {
    return 'Stock'
  }

  if (/product/.test(value)) {
    return 'Products'
  }

  if (/user|staff|employee|team/.test(value)) {
    return 'Team'
  }

  if (/login|logout|security|password/.test(value)) {
    return 'Security'
  }

  return 'Shop'
}

const categoryStyles = {
  Sales: {
    icon: ShoppingCart,
    color: 'bg-pink-100 text-pink-700',
  },
  Stock: {
    icon: Boxes,
    color: 'bg-blue-100 text-blue-700',
  },
  Products: {
    icon: Package,
    color: 'bg-violet-100 text-violet-700',
  },
  Team: {
    icon: Users,
    color: 'bg-emerald-100 text-emerald-700',
  },
  Security: {
    icon: ShieldCheck,
    color: 'bg-gray-100 text-gray-600',
  },
  Shop: {
    icon: ActivityIcon,
    color: 'bg-gray-100 text-gray-600',
  },
}

const filters = [
  'Everything',
  'Sales',
  'Stock',
  'Products',
  'Team',
  'Security',
  'Shop',
]

function groupActivities(activities) {
  return activities.reduce((groups, activity) => {
    const date = formatDate(activity.timestamp)

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(activity)

    return groups
  }, {})
}

export default function Activity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [activeFilter, setActiveFilter] = useState('Everything')

  useEffect(() => {
    return subscribeSyncStatus((status) => {
      setLastSyncAt(status.lastSyncAt)
    })
  }, [])

  useEffect(() => {
    let alive = true

    setLoading(true)

    listActivity({ limit: 50 })
      .then((data) => {
        if (!alive) return

        setActivities(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load activity:', error)

        if (alive) {
          setLoading(false)
        }
      })

    return () => {
      alive = false
    }
  }, [lastSyncAt])

  const filteredActivities = activities.filter((activity) => {
    if (activeFilter === 'Everything') return true

    return getCategory(activity) === activeFilter
  })

  const groupedActivities = groupActivities(filteredActivities)

  return (
    <div className="mx-auto w-full max-w-[1150px] space-y-6">

      {/* Page heading */}
      <div>
        

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900">
          Activity
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          A record of what happened in your shop and when.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium
              transition-colors
              ${
                activeFilter === filter
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Activity timeline */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          Loading activity...
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <ActivityIcon
            size={28}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="text-sm font-medium text-gray-700">
            No activity found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {activities.length === 0
              ? 'Sales and other shop activity will appear here.'
              : `There are no ${activeFilter.toLowerCase()} activities yet.`}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">

          {Object.entries(groupedActivities).map(
            ([date, entries]) => (
              <section key={date} className="mb-7 last:mb-0">

                {/* Date heading */}
                <h3 className="mb-5 text-sm font-semibold text-gray-800">
                  {date}
                </h3>

                {/* Timeline */}
                <div className="space-y-0">
                  {entries.map((activity, index) => {
                    const category = getCategory(activity)
                    const style = categoryStyles[category]
                    const Icon = style.icon

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-3 pb-5 last:pb-0"
                      >

                        {/* Timeline line */}
                        {index !== entries.length - 1 && (
                          <div className="absolute left-[15px] top-9 bottom-0 w-px bg-gray-200" />
                        )}

                        {/* Activity icon */}
                        <div
                          className={`
                            relative z-10 flex h-8 w-8 shrink-0
                            items-center justify-center rounded-full
                            ${style.color}
                          `}
                        >
                          <Icon size={15} strokeWidth={1.8} />
                        </div>

                        {/* Activity content */}
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">

                            <p className="text-sm font-medium leading-5 text-gray-900">
                              {describeActivity(activity)}
                            </p>

                            <span
                              className={`
                                inline-flex rounded-md px-2 py-0.5
                                text-[10px] font-medium
                                ${style.color}
                              `}
                            >
                              {category}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[11px] font-medium text-gray-500">
                              {formatTime(activity.timestamp)}
                            </span>

                            {activity.synced === 0 && (
                              <>
                                <span className="text-gray-300">·</span>

                                <span className="text-[11px] font-medium text-amber-600">
                                  Waiting to sync
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </section>
            )
          )}
        </div>
      )}

    </div>
  )
}
