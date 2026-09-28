
import { useNavigate } from 'react-router-dom'

export default function EndOfDay() {
  const navigate = useNavigate()

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>

        <h1 className="text-xl font-semibold text-gray-900">
          End of Day
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review today's shop activity
        </p>
      </div>

      {/* Summary */}
      <section className="rounded-2xl border border-pink-100 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Today's summary
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-pink-50 p-4">
            <p className="text-xs text-gray-500">
              Total sales
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              KSh 0
            </p>
          </div>

          <div className="rounded-xl bg-pink-50 p-4">
            <p className="text-xs text-gray-500">
              Sales count
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              0
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              Cash
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              KSh 0
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              M-Pesa
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              KSh 0
            </p>
          </div>
        </div>
      </section>

      {/* Sales breakdown */}
      <section className="rounded-2xl border border-pink-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">
          Sales breakdown
        </h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Cash sales
            </span>

            <span className="text-sm font-medium text-gray-800">
              KSh 0
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              M-Pesa sales
            </span>

            <span className="text-sm font-medium text-gray-800">
              KSh 0
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Bank card sales
            </span>

            <span className="text-sm font-medium text-gray-800">
              KSh 0
            </span>
          </div>

          <div className="border-t border-pink-50 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Total
              </span>

              <span className="text-base font-semibold text-pink-700">
                KSh 0
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder notice */}
      <div className="rounded-2xl bg-pink-50 px-5 py-4">
        <p className="text-sm font-medium text-pink-800">
          End-of-day reporting is coming later
        </p>

        <p className="mt-1 text-xs leading-5 text-pink-600">
          This screen is ready for the daily sales summary,
          payment breakdown, and closing workflow once reporting
          is connected.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate('/sales')}
          className="w-full rounded-2xl bg-pink-600 py-3.5 text-sm font-medium text-white"
        >
          View Today's Sales
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full rounded-2xl border border-pink-200 bg-white py-3.5 text-sm font-medium text-gray-700"
        >
          Back Home
        </button>
      </div>
    </div>
  )
}
