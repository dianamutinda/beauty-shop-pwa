import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listActivity, describeActivity } from '../../db/activity'
import { subscribeSyncStatus } from '../../db/sync'

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const today = new Date()

  const sameDay = date.toDateString() === today.toDateString()

  const time = date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (sameDay) {
    return time
  }

  return `${date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  })}, ${time}`
}

export default function Activity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastSyncAt, setLastSyncAt] = useState(null)

  // Reload activity after a sync finishes so activity
  // pulled from other phones appears automatically.
  useEffect(() => {
    return subscribeSyncStatus((status) => {
      setLastSyncAt(status.lastSyncAt)
    })
  }, [])

  useEffect(() => {
    let alive = true

    setLoading(true)

    listActivity({ limit: 50 }).then((data) => {
      if (!alive) return

      setActivities(data)
      setLoading(false)
    })

    return () => {
      alive = false
    }
  }, [lastSyncAt])

  if (loading) {
    return (
      <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
        Loading activity...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/owner/more"
          className="text-xs font-medium text-pink-700"
        >
          ← More
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-pink-700">
          Activity
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Recent activity in your shop.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No activity yet
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Sales and other shop activity will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-pink-100 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-5 text-gray-900">
                    {describeActivity(activity)}
                  </p>

                  {activity.synced === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      Waiting to sync
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-[11px] text-gray-400">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}