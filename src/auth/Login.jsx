import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRole } from './AuthContext'
import { clearPin } from './pin'
import { supabase } from '../db/supabase'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useRole()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    try {
      setLoading(true)

      await signIn(email.trim(), password)

      // Worker is signing in after forgetting their PIN.
      if (location.state?.resetPin) {
        const { data, error: userError } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (!data.user) {
          throw new Error('Unable to identify your account.')
        }

        await clearPin(data.user.id)

        navigate('/set-pin', {
          replace: true,
        })
      } else {
        navigate('/', {
          replace: true,
        })
      }
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50 px-5 py-8">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100">
            <span className="text-xl font-medium text-pink-700">
              BS
            </span>
          </div>

          <h1 className="text-2xl font-medium tracking-tight text-zinc-900">
            Beauty Shop
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Sign in to continue
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-800"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-800"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 pr-20 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-sm font-medium text-pink-700 disabled:opacity-50"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-pink-600 px-4 py-3.5 text-base font-medium text-white transition hover:bg-pink-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Beauty Shop Management
        </p>

      </div>
    </main>
  )
}