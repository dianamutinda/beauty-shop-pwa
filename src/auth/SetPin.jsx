
// src/auth/SetPin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setPin } from './pin'
import { useRole } from './AuthContext'

export default function SetPin() {
  const navigate = useNavigate()
  const { user } = useRole()

  const [stage, setStage] = useState('enter')
  const [firstPin, setFirstPin] = useState('')
  const [pin, setPinInput] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleDigit(digit) {
    if (saving || pin.length >= 4) return

    setError('')

    const next = pin + digit
    setPinInput(next)

    if (next.length !== 4) return

    if (stage === 'enter') {
      setFirstPin(next)
      setPinInput('')
      setStage('confirm')
      return
    }

    if (next !== firstPin) {
      setError("The PINs don't match. Let's try again.")
      setFirstPin('')
      setPinInput('')
      setStage('enter')
      return
    }

    try {
      setSaving(true)
      await setPin(user.id, next)
      navigate('/', { replace: true })
    } catch {
      setError('Could not save your PIN. Please try again.')
      setPinInput('')
      setSaving(false)
    }
  }

  function handleBackspace() {
    if (saving) return

    setError('')
    setPinInput((current) => current.slice(0, -1))
  }

  return (
    <main className="min-h-screen bg-pink-50/40 px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-sm items-center justify-center">
        <section className="w-full rounded-3xl border border-pink-100 bg-white px-6 py-8 shadow-sm">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100">
              <span className="text-lg text-pink-600">✦</span>
            </div>

            <h1 className="mt-5 text-xl font-medium text-gray-900">
              {stage === 'enter' ? 'Create your PIN' : 'Confirm your PIN'}
            </h1>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-gray-500">
              {stage === 'enter'
                ? 'Create a 4-digit PIN to quickly unlock the app on this device.'
                : 'Enter the same PIN again to make sure everything is correct.'}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-7 flex items-center justify-center gap-2">
            <span
              className={`h-1.5 w-12 rounded-full ${
                stage === 'enter' ? 'bg-pink-500' : 'bg-pink-200'
              }`}
            />
            <span
              className={`h-1.5 w-12 rounded-full ${
                stage === 'confirm' ? 'bg-pink-500' : 'bg-pink-100'
              }`}
            />
          </div>

          {/* PIN dots */}
          <div className="mt-8 flex justify-center gap-4">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-3.5 w-3.5 rounded-full border transition ${
                  index < pin.length
                    ? 'border-pink-500 bg-pink-500'
                    : 'border-gray-300 bg-white'
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-center text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Keypad */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => handleDigit(String(number))}
                disabled={saving}
                className="flex h-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-lg font-medium text-gray-800 transition active:scale-95 active:bg-pink-50 disabled:opacity-50"
              >
                {number}
              </button>
            ))}

            <div />

            <button
              type="button"
              onClick={() => handleDigit('0')}
              disabled={saving}
              className="flex h-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-lg font-medium text-gray-800 transition active:scale-95 active:bg-pink-50 disabled:opacity-50"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              disabled={saving || pin.length === 0}
              aria-label="Delete last digit"
              className="flex h-14 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 transition active:scale-95 active:bg-gray-50 disabled:opacity-30"
            >
              ←
            </button>
          </div>

          {/* Saving state */}
          {saving && (
            <p className="mt-5 text-center text-xs text-gray-400">
              Saving your PIN...
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

