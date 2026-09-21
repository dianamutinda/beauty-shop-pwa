import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDashboardStats } from '../../db/dashboard'
import { formatKsh } from '../../lib/format'

function Card({ label, value, note, to, valueClass = 'text-gray-900' }) {
  const body = (
    <>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${valueClass}`}>{value}</p>
      {note && <p className="text-xs text-gray-400">{note}</p>}
    </>
  )
  const className = 'block rounded-xl border border-pink-100 bg-white p-4'
  return to ? (
    <Link to={to} className={className}>{body}</Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

const ACTIONS = [
  { to: '/owner/products/new', label: 'Add Product' },
  { to: '/owner/stock', label: 'Update Stock' },
  { to: '/owner/count', label: 'Count Stock' },
]

export default function Dashboard() {
  const stats = useLiveQuery(() => getDashboardStats(), [])

  if (!stats) return null

  const units = `${stats.unitsSoldToday} ${stats.unitsSoldToday === 1 ? 'unit' : 'units'} sold`
  const discount = stats.discountToday > 0 ? ` · ${formatKsh(stats.discountToday)} discounted` : ''

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-pink-700">Overview</h2>

      {stats.totalProducts === 0 && (
        <div className="rounded-xl bg-pink-100 p-4 text-sm text-pink-800">
          Your shop has no products yet.{' '}
          <Link to="/owner/products/new" className="font-semibold underline">Add the first one</Link>.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card label="Total Products" value={stats.totalProducts} to="/owner/products" />
        <Card
          label="Low Stock"
          value={stats.lowStock}
          note={stats.outOfStock > 0 ? `${stats.outOfStock} out of stock` : undefined}
          valueClass={stats.lowStock > 0 ? 'text-amber-600' : 'text-gray-900'}
          to="/owner/stock?filter=low"
        />
        <Card label="Sales Today" value={formatKsh(stats.salesToday)} note={units + discount} />
        <Card label="Stock Value" value={formatKsh(stats.stockValue)} note="at selling price" />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-xl border border-pink-100 bg-white px-2 py-4 text-center text-xs text-pink-700"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}