import { useState } from 'react'
import { checkPin } from '../db/settings'

export default function PinDialog({ onSuccess, onCancel }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setChecking(true)
    const ok = await checkPin(pin)
    setChecking(false)

    if (ok) {
      onSuccess()
    } else {
      setError('Wrong PIN. Try again.')
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 rounded-2xl bg-white p-5">
        <h3 className="text-lg font-semibold text-pink-700">Owner PIN</h3>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="w-full rounded-xl border border-pink-200 px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-pink-400"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-pink-300 py-2 text-sm text-pink-700">
            Cancel
          </button>
          <button type="submit" disabled={checking || !pin} className="rounded-xl bg-pink-600 py-2 text-sm text-white disabled:opacity-50">
            Unlock
          </button>
        </div>
      </form>
    </div>
  )
}