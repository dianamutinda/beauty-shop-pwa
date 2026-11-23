
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react'

import { getProductDetails } from '../../db/products'
import {
  listMovements,
  recordStockMovement,
} from '../../db/stock'
import {
  formatKsh,
  formatUpdated,
  stockStatus,
} from '../../lib/format'

import PageContainer from '../../components/layout/PageContainer'
import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const REASONS = {
  add: [
    { label: 'Restock', type: 'restock' },
    { label: 'Correction', type: 'adjustment' },
  ],
  remove: [
    { label: 'Sold', type: 'sale' },
    { label: 'Damaged or expired', type: 'adjustment' },
    { label: 'Lost or stolen', type: 'adjustment' },
    { label: 'Correction', type: 'adjustment' },
  ],
}

const TYPE_LABELS = {
  opening: 'Opening stock',
  restock: 'Restock',
  sale: 'Sale',
  adjustment: 'Adjustment',
}

export default function StockUpdate() {
  const { id } = useParams()

  const details = useLiveQuery(
    () => getProductDetails(id),
    [id]
  )

  const movements =
    useLiveQuery(
      () => listMovements(id),
      [id]
    ) ?? []

  const [mode, setMode] = useState('add')
  const [reasonIndex, setReasonIndex] = useState(0)
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  if (details === undefined) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-sm text-text-muted">
          Loading product...
        </div>
      </PageContainer>
    )
  }

  if (details === null) {
    return (
      <PageContainer>
        <div className="space-y-5">
          <Link
            to="/owner/stock"
            className="inline-flex items-center gap-1 text-sm font-medium text-interactive-primary"
          >
            <ChevronLeft size={16} />
            Stock
          </Link>

          <Card variant="outlined" padding="lg">
            <div className="py-4 text-center">
              <p className="text-sm font-medium text-text-primary">
                Product not found
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                This product no longer exists.
              </p>
            </div>
          </Card>
        </div>
      </PageContainer>
    )
  }

  const { product } = details

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

  const isSale =
    mode === 'remove' &&
    REASONS.remove[reasonIndex].type === 'sale'

  function switchMode(next) {
    setMode(next)
    setReasonIndex(0)
    setPrice('')
    setError('')
    setMessage('')
  }

  function changeReason(value) {
    setReasonIndex(Number(value))
    setPrice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setMessage('')

    const qty = Number(quantity)

    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Enter a whole number greater than zero.')
      return
    }

    const reason = REASONS[mode][reasonIndex]

    const signed =
      mode === 'add' ? qty : -qty

    const fullNote = [
      reason.label,
      note.trim(),
    ]
      .filter(Boolean)
      .join(': ')

    let unitPrice = null
    let listPrice = null

    if (reason.type === 'sale') {
      listPrice = product.sellingPrice

      unitPrice =
        price === ''
          ? listPrice
          : Number(price)

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        setError(
          'Enter the price per unit as a number, 0 or more.'
        )
        return
      }
    }

    setSaving(true)

    try {
      const newStock = await recordStockMovement(
        id,
        reason.type,
        signed,
        {
          note: fullNote,
          unitPrice,
          listPrice,
        }
      )

      setMessage(`Saved. Stock is now ${newStock}.`)

      setQuantity('')
      setPrice('')
      setNote('')
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
          title="Update Stock"
          description={`${product.name} · SKU: ${product.sku}`}
        />

        {/* Current stock */}
        <Card variant="outlined" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Current stock
              </p>

              <p className="mt-2 text-4xl font-semibold tracking-tight text-text-primary tabular-nums">
                {product.stock}
              </p>

              <p className="mt-1 text-sm text-text-muted">
                {product.stock === 1
                  ? 'unit available'
                  : 'units available'}
              </p>
            </div>

            <Badge variant={badgeVariant} size="md">
              {status.label}
            </Badge>
          </div>
        </Card>

        {/* Stock form */}
        <Card variant="outlined" padding="lg">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-text-primary">
              Update stock
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Record a stock movement so your inventory history stays accurate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Add / Remove */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={mode === 'add' ? 'primary' : 'outline'}
                fullWidth
                onClick={() => switchMode('add')}
              >
                <ArrowUpFromLine size={17} />
                Add stock
              </Button>

              <Button
                type="button"
                variant={mode === 'remove' ? 'danger' : 'outline'}
                fullWidth
                onClick={() => switchMode('remove')}
              >
                <ArrowDownToLine size={17} />
                Remove stock
              </Button>
            </div>

            {/* Reason */}
            <Select
              label="Reason"
              value={String(reasonIndex)}
              onChange={changeReason}
              options={REASONS[mode].map((reason, index) => ({
                value: String(index),
                label: reason.label,
              }))}
            />

            {/* Quantity */}
            <Input
              label="Quantity"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="e.g. 10"
              required
            />

            {/* Sale price */}
            {isSale && (
              <div className="space-y-2">
                <Input
                  label="Price per unit"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder={`Default: ${formatKsh(product.sellingPrice)}`}
                />

                <p className="text-xs text-text-muted">
                  Leave blank to use the product's current selling price.
                </p>
              </div>
            )}

            {/* Note */}
            <Input
              label="Note"
              hint="Optional"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note..."
            />

            {/* Messages */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 p-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-error"
                />
                <p className="text-sm leading-5 text-error">
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-success"
                />
                <p className="text-sm leading-5 text-success">
                  {message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={saving}
              disabled={saving}
            >
              Save Stock Update
            </Button>
          </form>
        </Card>

        {/* History */}
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Stock History
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Recent changes to this product's stock.
            </p>
          </div>

          {movements.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <div className="py-4 text-center">
                <p className="text-sm font-medium text-text-primary">
                  No stock movements yet
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Stock changes will appear here after you save an update.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {movements.map((movement) => {
                const isAddition = movement.quantity > 0

                return (
                  <Card
                    key={movement.id}
                    variant="outlined"
                    padding="md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {movement.note ||
                            TYPE_LABELS[movement.type] ||
                            movement.type}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          {formatUpdated(movement.timestamp)}

                          {movement.type === 'sale' &&
                            movement.unitPrice != null && (
                              <>
                                {' '}· @ {formatKsh(movement.unitPrice)}

                                {movement.listPrice != null &&
                                  movement.unitPrice < movement.listPrice &&
                                  ` (list ${formatKsh(movement.listPrice)})`}
                              </>
                            )}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums ${
                          isAddition
                            ? 'bg-success/10 text-success'
                            : 'bg-error/10 text-error'
                        }`}
                      >
                        {isAddition ? '+' : ''}
                        {movement.quantity}
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  )
}
