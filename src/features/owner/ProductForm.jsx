
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import PageContainer from '../../components/layout/PageContainer'
import PageHeader from '../../components/layout/PageHeader'

function validate(values, isNew) {
  if (!values.name.trim()) {
    return 'Product name is required.'
  }

  if (!values.sku.trim()) {
    return 'SKU is required.'
  }

  if (!values.categoryId) {
    return 'Pick a category.'
  }

  const price = Number(values.sellingPrice)

  if (
    values.sellingPrice === '' ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return 'Enter a valid selling price.'
  }

  if (values.buyingPrice !== '') {
    const buying = Number(values.buyingPrice)

    if (!Number.isFinite(buying) || buying < 0) {
      return 'Buying price must be a number.'
    }
  }

  if (isNew) {
    const stock = Number(values.stock)

    if (
      values.stock === '' ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return 'Stock must be a whole number, 0 or more.'
    }
  }

  return ''
}

export default function ProductForm({
  initial,
  categories,
  onSubmit,
  submitLabel,
  isNew,
}) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const navigate = useNavigate()

  function set(field) {
    return (e) => {
      setValues((current) => ({
        ...current,
        [field]: e.target.value,
      }))
    }
  }

  function setCategory(value) {
    setValues((current) => ({
      ...current,
      categoryId: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const problem = validate(values, isNew)

    if (problem) {
      setError(problem)
      return
    }

    setError('')
    setSaving(true)

    try {
      await onSubmit(values)
    } catch (err) {
      setError(
        err.name === 'ConstraintError'
          ? 'A product with that SKU already exists.'
          : 'Could not save. Please try again.'
      )

      setSaving(false)
    }
  }

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  return (
    <PageContainer
      maxWidth="max-w-4xl"
      className="pb-10"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        

        

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 p-4">
            <AlertCircle
              size={18}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-error"
            />

            <p className="text-sm leading-5 text-text-primary">
              {error}
            </p>
          </div>
        )}

        {/* Product Information */}
        <Card
          variant="outlined"
          padding="lg"
          className="space-y-5"
        >
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Product Information
            </h3>

            <p className="mt-1 text-xs text-text-muted">
              Basic details used to identify the product.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Product Name"
              value={values.name}
              onChange={set('name')}
              placeholder="e.g. Face Cream"
              required
            />

            <Input
              label="SKU / Code"
              value={values.sku}
              onChange={set('sku')}
              placeholder="e.g. FC001"
              required
            />

            <div className="sm:col-span-2">
              <Select
                label="Category *"
                options={categoryOptions}
                value={values.categoryId}
                onChange={setCategory}
                placeholder="Select category"
                searchable
                searchPlaceholder="Search categories..."
                noOptionsMessage="No categories found"
                size="md"
                disabled={categories.length === 0}
              />

              {categories.length === 0 && (
                <p className="mt-2 text-xs text-text-muted">
                  No categories yet.{' '}
                  <Link
                    to="/owner/categories"
                    className="font-medium text-interactive-primary underline"
                  >
                    Add one first
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Pricing & Stock */}
        <Card
          variant="outlined"
          padding="lg"
          className="space-y-5"
        >
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Pricing & Stock
            </h3>

            <p className="mt-1 text-xs text-text-muted">
              Set the product price and starting stock.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Selling Price (KSh)"
              type="text"
              inputMode="decimal"
              value={values.sellingPrice}
              onChange={set('sellingPrice')}
              placeholder="350"
              required
            />

            {isNew ? (
              <Input
                label="Stock Quantity"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={values.stock}
                onChange={set('stock')}
                placeholder="12"
                required
              />
            ) : (
              <Input
                label="Current Stock"
                value={String(initial.stock)}
                readOnly
                disabled
              />
            )}
          </div>

          {!isNew && (
            <div className="rounded-xl border border-border bg-interactive-soft p-3">
              <p className="text-xs leading-5 text-text-secondary">
                Stock changes are made from the Stock screen so every adjustment is recorded in your stock history.
              </p>
            </div>
          )}

          <Input
            label="Buying Price (KSh), optional"
            hint="Used internally to help you understand your product costs."
            type="text"
            inputMode="decimal"
            value={values.buyingPrice}
            onChange={set('buyingPrice')}
            placeholder="150"
          />
        </Card>

        {/* Additional Information */}
        <Card
          variant="outlined"
          padding="lg"
          className="space-y-5"
        >
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Additional Information
            </h3>

            <p className="mt-1 text-xs text-text-muted">
              Optional information about the product.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Description, optional
            </label>

            <textarea
              rows={4}
              value={values.description}
              onChange={set('description')}
              placeholder="Add a short description..."
              className="
                w-full resize-y rounded-xl border border-border
                bg-background px-4 py-3 text-sm text-text-primary
                outline-none placeholder:text-text-muted
                transition-colors
                focus:border-interactive-primary
                focus:ring-2 focus:ring-interactive-soft
              "
            />
          </div>
        </Card>

        {/* Form actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-divider pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={saving}
            onClick={() => navigate('/owner/products')}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            className="w-full sm:w-auto"
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
