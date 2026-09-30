import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../db/supabase'

export default function AddWorker() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
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

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSaving(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Your session has expired. Please sign in again.')
      }

      const { data, error: functionError } =
        await supabase.functions.invoke('create-worker', {
          body: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            password: form.password,
          },
        })

      if (functionError) {
        throw functionError
      }

      if (data?.error) {
        throw new Error(data.error)
      }

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
          Create a login account for someone who works in the shop.
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
            disabled={saving}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400 disabled:bg-gray-50"
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
            disabled={saving}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400 disabled:bg-gray-50"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="e.g. jane@example.com"
            autoComplete="email"
            disabled={saving}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400 disabled:bg-gray-50"
            required
          />

          <p className="mt-1.5 text-xs text-gray-400">
            The worker will use this email to sign in.
          </p>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Temporary password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            placeholder="Create a temporary password"
            autoComplete="new-password"
            minLength={6}
            disabled={saving}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-400 disabled:bg-gray-50"
            required
          />

          <p className="mt-1.5 text-xs text-gray-400">
            Give this password to the worker so they can sign in.
          </p>
        </div>

        <div className="rounded-lg bg-pink-50 p-3">
          <p className="text-xs leading-5 text-pink-800">
            The worker will set their own app PIN after signing in.
            The PIN is separate from their account password.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-pink-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Creating worker...' : 'Add Worker'}
        </button>
      </form>
    </div>
  )
}