import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../../db/supabase'

function WorkerCard({ worker }) {
  return (
    <Link
      to={`/owner/workers/${worker.id}`}
      className="block rounded-xl border border-pink-100 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {worker.display_name}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {worker.phone || 'No phone number'}
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
  const [workers, setWorkers] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadWorkers() {
      setError('')

      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, display_name, phone, active')
        .eq('role', 'worker')
        .order('display_name')

      if (queryError) {
        setError(queryError.message)
        setWorkers([])
        return
      }

      setWorkers(data || [])
    }

    loadWorkers()
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            to="/owner/more"
            className="font-medium text-pink-700"
          >
            More
          </Link>

          <span className="text-gray-300">/</span>

          <span className="text-gray-400">
            Workers
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
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
      </div>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Could not load workers
          </p>

          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        </div>
      ) : !workers ? (
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