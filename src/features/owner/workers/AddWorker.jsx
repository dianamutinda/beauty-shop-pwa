import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addWorker } from '../../../db/workers'

export default function AddWorker() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    pin: '',
  })

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      await addWorker(form)
      navigate('/owner/workers')
    } catch (err) {
      setError(err.message || 'Could not add worker')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/owner/workers"
          className="text-xs font-medium text-pink-700"
        >
          ← Workers
        </Link>

        <h2 className="mt-3 text-xl font-semibold text-pink-700">
          Add Worker
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Create an account for someone who works in the shop.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
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
            placeholder="e.g. Jane Wanjiku"
            autoComplete="name"
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
            placeholder="e.g. 0712345678"
            autoComplete="tel"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
            required
          />
        </div>

        <div>
          <label
            htmlFor="pin"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Worker PIN
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
            placeholder="4–6 digits"
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
            required
          />

          <p className="mt-1.5 text-xs text-gray-400">
            The worker will use this PIN to access their account.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-pink-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add Worker'}
        </button>
      </form>
    </div>
  )
}