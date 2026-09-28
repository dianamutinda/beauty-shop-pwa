
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getWorker,
  updateWorker,
  deactivateWorker,
  activateWorker,
} from '../../../db/workers'

export default function WorkerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const worker = useLiveQuery(
    () => getWorker(id),
    [id]
  )

  const [form, setForm] = useState({
    name: '',
    phone: '',
    pin: '',
  })

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)

  useEffect(() => {
    if (!worker) return

    setForm({
      name: worker.name ?? '',
      phone: worker.phone ?? '',
      pin: '',
    })
  }, [worker])

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const changes = {
        name: form.name,
        phone: form.phone,
      }

      if (form.pin.trim()) {
        changes.pin = form.pin
      }

      await updateWorker(id, changes)

      navigate('/owner/workers')
    } catch (err) {
      setError(err.message || 'Could not update worker')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate() {
    setError('')
    setDeactivating(true)

    try {
      await deactivateWorker(id)
      setShowDeactivate(false)
    } catch (err) {
      setError(err.message || 'Could not deactivate worker')
    } finally {
      setDeactivating(false)
    }
  }

  async function handleActivate() {
    setError('')
    setSaving(true)

    try {
      await activateWorker(id)
    } catch (err) {
      setError(err.message || 'Could not activate worker')
    } finally {
      setSaving(false)
    }
  }

  if (worker === undefined) {
    return (
      <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
        Loading worker...
      </div>
    )
  }

  if (worker === null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            to="/owner/more"
            className="font-medium text-pink-700"
          >
            More
          </Link>

          <span className="text-gray-300">/</span>

          <Link
            to="/owner/workers"
            className="font-medium text-pink-700"
          >
            Workers
          </Link>

          <span className="text-gray-300">/</span>

          <span className="text-gray-400">
            Worker Profile
          </span>
        </div>

        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            Worker not found
          </p>

          <Link
            to="/owner/workers"
            className="mt-3 inline-block text-xs font-medium text-pink-700"
          >
            Back to Workers
          </Link>
        </div>
      </div>
    )
  }

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

          <Link
            to="/owner/workers"
            className="font-medium text-pink-700"
          >
            Workers
          </Link>

          <span className="text-gray-300">/</span>

          <span className="text-gray-400">
            Worker Profile
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-pink-700">
              Worker Profile
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage this worker's account.
            </p>
          </div>

          <span
            className={
              worker.active
                ? 'rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-medium text-pink-700'
                : 'rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500'
            }
          >
            {worker.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-pink-100 bg-white p-4"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={updateField}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
            required
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Phone
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={updateField}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
            required
          />
        </div>

        <div>
          <label
            htmlFor="pin"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            New PIN
          </label>

          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]{4,6}"
            maxLength={6}
            value={form.pin}
            onChange={updateField}
            placeholder="Leave blank to keep current PIN"
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
          />

          <p className="mt-1.5 text-xs text-gray-400">
            Enter a new 4–6 digit PIN only if you want to change it.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || deactivating}
          className="w-full rounded-lg bg-pink-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {worker.active && (
        <section className="rounded-xl border border-red-100 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-900">
            Deactivate Worker
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            This keeps the worker's history but prevents the account
            from being used.
          </p>

          {!showDeactivate ? (
            <button
              type="button"
              onClick={() => setShowDeactivate(true)}
              className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600"
            >
              Deactivate Worker
            </button>
          ) : (
            <div className="mt-3 rounded-lg bg-red-50 p-3">
              <p className="text-xs text-red-700">
                Are you sure you want to deactivate {worker.name}?
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeactivate(false)}
                  disabled={deactivating}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600"
                >
                  Keep Active
                </button>

                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  {deactivating
                    ? 'Deactivating...'
                    : 'Deactivate'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {!worker.active && (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-900">
            Worker is Inactive
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            This worker cannot use their account while inactive.
            Their previous activity and sales history are kept.
          </p>

          <button
            type="button"
            onClick={handleActivate}
            disabled={saving}
            className="mt-3 rounded-lg bg-pink-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Activating...' : 'Activate Worker'}
          </button>
        </section>
      )}
    </div>
  )
}

