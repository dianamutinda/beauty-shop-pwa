
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Search,
  ClipboardCheck,
} from 'lucide-react'

import { searchProducts } from '../../db/products'
import {
  getLowStockDefault,
  setLowStockDefault,
} from '../../db/settings'
import { stockStatus } from '../../lib/format'

import Card from '../../features/sales/components/ui/Card'
import Badge from '../../features/sales/components/ui/Badge'
import Button from '../../features/sales/components/ui/Button'
import Input from '../../features/sales/components/ui/Input'
import PageContainer from '../../features/sales/components/layout/PageContainer'
import PageHeader from '../../features/sales/components/layout/PageHeader'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low Stock' },
  { id: 'out', label: 'Out of Stock' },
  { id: 'in', label: 'In Stock' },
]

function matchesFilter(filter, product) {
  if (filter === 'low') {
    return product.stock > 0 &&
      product.stock <= product.lowStockAt
  }

  if (filter === 'out') {
    return product.stock <= 0
  }

  if (filter === 'in') {
    return product.stock > product.lowStockAt
  }

  return true
}

function StockCard({ product }) {
  const navigate = useNavigate()

  const status = stockStatus(
    product.stock,
    product.lowStockAt
  )

  const badgeVariant =
    product.stock <= 0
      ? 'danger'
      : product.stock <= product.lowStockAt
        ? 'warning'
        : 'success'

  return (
    <Card
      variant="outlined"
      padding="md"
      className="h-full transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {product.name}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={badgeVariant} size="sm">
              {status.label}
            </Badge>

            <span className="text-xs text-text-muted">
              {product.stock}{' '}
              {product.stock === 1 ? 'unit' : 'units'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/owner/stock/${product.id}`)}
        >
          Restock
        </Button>
      </div>
    </Card>
  )
}

export default function Stock() {
  const [text, setText] = useState('')
  const [params] = useSearchParams()

  const initialFilter = ['low', 'out', 'in'].includes(
    params.get('filter')
  )
    ? params.get('filter')
    : 'all'

  const [filter, setFilter] = useState(initialFilter)

  const products = useLiveQuery(
    () => searchProducts(text),
    [text]
  )

  const lowDefault = useLiveQuery(
    () => getLowStockDefault(),
    []
  )

  const visible = (products ?? []).filter(
    (product) => matchesFilter(filter, product)
  )

  return (
    <PageContainer maxWidth="max-w-[1440px]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="Stock"
            description="Update and review your inventory levels."
          />
        </div>

        {/* Search */}
        <div className="max-w-xl">
          <Input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search products..."
            leftIcon={<Search size={18} strokeWidth={1.8} />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={filter === item.id ? 'primary' : 'outline'}
              onClick={() => setFilter(item.id)}
              className="rounded-full"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Low-stock threshold */}
        {lowDefault !== undefined && (
          <Card variant="outlined" padding="md">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  Low-stock warning
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Warn when stock reaches this quantity or below.
                </p>
              </div>

              <div className="w-20 shrink-0">
                <Input
                  key={lowDefault}
                  type="number"
                  min="0"
                  defaultValue={lowDefault}
                  onBlur={(e) =>
                    setLowStockDefault(e.target.value).catch(() => {
                      e.target.value = lowDefault
                    })
                  }
                  className="text-center"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {!products ? (
          <Card variant="outlined" padding="lg">
            <p className="text-center text-sm text-text-muted">
              Loading stock...
            </p>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                {visible.length}{' '}
                {visible.length === 1 ? 'product' : 'products'}
              </p>

              {text && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setText('')}
                >
                  Clear search
                </Button>
              )}
            </div>

            {visible.length === 0 ? (
              <Card
                variant="outlined"
                padding="lg"
                className="text-center"
              >
                <p className="text-sm font-semibold text-text-primary">
                  {products.length === 0
                    ? 'No products yet'
                    : 'No products found'}
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                  {products.length === 0
                    ? 'Add products before managing their stock.'
                    : text
                      ? `Nothing matches "${text}". Try another product name.`
                      : 'No products match this stock filter.'}
                </p>

                {products.length === 0 && (
                  <Link
                    to="/owner/products/new"
                    className="mt-4 inline-block"
                  >
                    <Button size="md">
                      Add Product
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {visible.map((product) => (
                  <StockCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Count Stock */}
      <Link
        to="/owner/count"
        className="fixed bottom-7 right-7 z-30"
      >
        <Button
          size="lg"
          className="rounded-full shadow-md"
        >
          <ClipboardCheck size={19} strokeWidth={2.2} />
          Count Stock
        </Button>
      </Link>
    </PageContainer>
  )
}
