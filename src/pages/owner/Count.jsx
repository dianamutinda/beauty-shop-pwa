
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react'

import {
  listProducts,
  searchProducts,
} from '../../db/products'
import { applyStockCount } from '../../db/stock'
import PageContainer from '../../features/sales/components/layout/PageContainer'
import PageHeader from '../../features/sales/components/layout/PageHeader'
import Card from '../../features/sales/components/ui/Card'
import Badge from '../../features/sales/components/ui/Badge'
import Button from '../../features/sales/components/ui/Button'
import Input from '../../features/sales/components/ui/Input'

// null = nothing entered
// NaN = entered but invalid
// otherwise = the counted number
function parseCount(value) {
  if (value === undefined || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isInteger(number) && number >= 0
    ? number
    : NaN
}

export default function Count() {
  const [text, setText] = useState('')
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const all = useLiveQuery(
    () => listProducts(),
    []
  ) ?? []

  const visible = useLiveQuery(
    () => searchProducts(text),
    [text]
  ) ?? []

  const entered = all
    .map((product) => ({
      product,
      counted: parseCount(counts[product.id]),
    }))
    .filter((entry) => entry.counted !== null)

  const hasInvalid = entered.some(
    (entry) => Number.isNaN(entry.counted)
  )

  const changes = entered.filter(
    (entry) =>
      !Number.isNaN(entry.counted) &&
      entry.counted !== entry.product.stock
  )

  const net = changes.reduce(
    (sum, entry) =>
      sum + (entry.counted - entry.product.stock),
    0
  )

  function setCount(id, value) {
    setCounts((current) => ({
      ...current,
      [id]: value,
    }))

    setError('')
    setMessage('')
  }

  async function handleApply() {
    const word =
      changes.length === 1 ? 'product' : 'products'

    if (
      !window.confirm(
        `Adjust stock for ${changes.length} ${word} to match your count?`
      )
    ) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const adjusted = await applyStockCount(
        changes.map((entry) => ({
          productId: entry.product.id,
          counted: entry.counted,
        }))
      )

      setCounts({})

      setMessage(
        `Done. ${adjusted} ${
          adjusted === 1 ? 'product' : 'products'
        } adjusted.`
      )
    } catch (err) {
      setError(
        err.message || 'Could not save. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Stock Count"
          description="Enter the quantity you actually count on the shelf."
        />

        {/* Information */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
          <ClipboardCheck
            size={19}
            className="mt-0.5 shrink-0 text-interactive-primary"
          />
          <p className="text-sm leading-5 text-text-secondary">
            Nothing changes until you apply the count. You can
            review all differences before updating your stock.
          </p>
        </div>

        {/* Count summary */}
        <Card
          variant="outlined"
          padding="md"
          className="sticky top-0 z-10"
        >
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-surface p-3 text-center">
              <p className="text-xl font-semibold tabular-nums text-text-primary">
                {entered.length}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Counted
              </p>
            </div>

            <div className="rounded-lg bg-warning/10 p-3 text-center">
              <p className="text-xl font-semibold tabular-nums text-warning">
                {changes.length}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Different
              </p>
            </div>

            <div className="rounded-lg bg-interactive-soft p-3 text-center">
              <p className="text-xl font-semibold tabular-nums text-interactive-primary">
                {net > 0 ? '+' : ''}
                {net}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Net units
              </p>
            </div>
          </div>

          {hasInvalid && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-3">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-error"
              />
              <p className="text-sm leading-5 text-error">
                Counts must be whole numbers, 0 or more.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-3">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-error"
              />
              <p className="text-sm leading-5 text-error">
                {error}
              </p>
            </div>
          )}

          {message && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-success"
              />
              <p className="text-sm leading-5 text-success">
                {message}
              </p>
            </div>
          )}

          <Button
            type="button"
            fullWidth
            className="mt-3"
            onClick={handleApply}
            loading={saving}
            disabled={
              saving ||
              hasInvalid ||
              changes.length === 0
            }
          >
            Apply count ({changes.length})
          </Button>
        </Card>

        {/* Search */}
        <Input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search products..."
          leftIcon={<Search size={17} />}
        />

        {/* Product list */}
        {all.length === 0 ? (
          <Card variant="outlined" padding="lg">
            <div className="py-4 text-center">
              <p className="text-sm font-medium text-text-primary">
                No products to count yet
              </p>

              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Add products before performing a stock count.
              </p>

              <Link
                to="/owner/products/new"
                className="mt-4 inline-flex"
              >
                <Button size="md">
                  Add Product
                </Button>
              </Link>
            </div>
          </Card>
        ) : visible.length === 0 ? (
          <Card variant="outlined" padding="lg">
            <div className="py-4 text-center">
              <p className="text-sm font-medium text-text-primary">
                No products found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Nothing matches "{text}".
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map((product) => {
              const counted = parseCount(counts[product.id])
              const invalid = Number.isNaN(counted)

              const diff =
                counted !== null && !invalid
                  ? counted - product.stock
                  : null

              return (
                <Card
                  key={product.id}
                  variant="outlined"
                  padding="md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        System stock: {product.stock}
                      </p>

                      {diff !== null && (
                        <div className="mt-2">
                          {diff === 0 ? (
                            <Badge
                              variant="success"
                              size="sm"
                            >
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                Matches
                              </span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="warning"
                              size="sm"
                            >
                              {diff > 0 ? '+' : ''}
                              {diff}{' '}
                              {Math.abs(diff) === 1
                                ? 'unit'
                                : 'units'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-24 shrink-0">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        size="md"
                        value={counts[product.id] ?? ''}
                        onChange={(event) =>
                          setCount(
                            product.id,
                            event.target.value
                          )
                        }
                        placeholder="0"
                        error={
                          invalid
                            ? 'Invalid'
                            : ''
                        }
                        className="text-center tabular-nums"
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
