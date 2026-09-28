
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { listActivity } from '../../db/activity'

function formatActivity(action) {
  const labels = {
    'worker.added': 'Worker added',
    'worker.updated': 'Worker updated',
    'sale.recorded': 'Sale recorded',
    'sale.voided': 'Sale cancelled',
  }

  return labels[action] ?? action
}

function formatTime(timestamp) {
  const date = new Date(timestamp)

  return date.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getDetails(activity) {
  const details = activity.details ?? {}

  if (activity.action === 'worker.added') {
    return details.name ?? 'Worker'
  }

  if (activity.action === 'worker.updated') {
    return details.name ?? 'Worker details updated'
  }

  if (activity.action === 'sale.recorded') {
    return 'Sale recorded'
  }

  if (activity.action === 'sale.voided') {
    return 'Sale cancelled'
  }

  return ''
}

export default function Activity() {
  const activities = useLiveQuery(
    () => listActivity({ limit: 50 }),
    []
  )

  if (!activities) {
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
            Actions such as sales and worker changes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const detail = getDetails(activity)

            return (
              <div
                key={activity.id}
                className="rounded-xl border border-pink-100 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatActivity(activity.action)}
                    </p>

                    {detail && (
                      <p className="mt-1 text-xs text-gray-500">
                        {detail}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-[11px] text-gray-400">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
