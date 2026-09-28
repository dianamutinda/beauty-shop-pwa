import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { listWorkers } from '../../../db/workers'

function WorkerCard({ worker }) {
  return (
    <Link
      to={`/owner/workers/${worker.id}`}
      className="block rounded-xl border border-pink-100 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {worker.name}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {worker.phone}
          </p>
        </div>

        <span
          className={
            worker.active
              ? 'shrink-0 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-medium text-pink-700'
              : 'shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500'
          }
        >
          {worker.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Worker
      </p>
    </Link>
  )
}

export default function Workers() {
  const workers = useLiveQuery(
    () => listWorkers(),
    []
  )

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-pink-700">
            Workers
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage people who use the shop app.
          </p>
        </div>

        <Link
          to="/owner/workers/new"
          className="shrink-0 rounded-lg bg-pink-600 px-3 py-2 text-xs font-medium text-white"
        >
          Add Worker
        </Link>
      </div>

      {!workers ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
          Loading workers...
        </div>
      ) : workers.length === 0 ? (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No workers yet
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Add a worker to give them access to the shop app.
          </p>

          <Link
            to="/owner/workers/new"
            className="mt-4 inline-block rounded-lg bg-pink-600 px-4 py-2 text-xs font-medium text-white"
          >
            Add First Worker
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
            />
          ))}
        </div>
      )}
    </div>
  )
}