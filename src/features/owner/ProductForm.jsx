
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

const inputClass =
  'w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50'

function Field({ label, required, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </span>

      {children}

      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-gray-400">
          {hint}
        </p>
      )}
    </label>
  )
}

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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="flex items-center gap-1.5 text-xs">
        <Link
          to="/owner"
          className="font-medium text-pink-700"
        >
          Dashboard
        </Link>

        <span className="text-gray-300">/</span>

        <Link
          to="/owner/products"
          className="font-medium text-pink-700"
        >
          Products
        </Link>

        <span className="text-gray-300">/</span>

        <span className="text-gray-400">
          {isNew ? 'Add Product' : 'Edit Product'}
        </span>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-pink-700">
          {isNew ? 'Add Product' : 'Edit Product'}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {isNew
            ? 'Add a product to your shop inventory.'
            : 'Update this product’s information.'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5">
          <AlertCircle
            size={17}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <p className="text-sm leading-5 text-red-700">
            {error}
          </p>
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-pink-100 bg-white p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Product Information
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Basic details used to identify the product.
          </p>
        </div>

        <Field label="Product Name" required>
          <input
            className={inputClass}
            type="text"
            value={values.name}
            onChange={set('name')}
            placeholder="e.g. Face Cream"
            required
          />
        </Field>

        <Field label="SKU / Code" required>
          <input
            className={inputClass}
            type="text"
            value={values.sku}
            onChange={set('sku')}
            placeholder="e.g. FC001"
            required
          />
        </Field>

        <Field label="Category" required>
          <select
            className={inputClass}
            value={values.categoryId}
            onChange={set('categoryId')}
            required
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {categories.length === 0 && (
            <p className="mt-1.5 text-xs text-gray-400">
              No categories yet.{' '}
              <Link
                to="/owner/categories"
                className="font-medium text-pink-700 underline"
              >
                Add one first
              </Link>
              .
            </p>
          )}
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-pink-100 bg-white p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Pricing & Stock
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Set the product price and starting stock.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Selling Price (KSh)" required>
            <input
              className={inputClass}
              type="number"
              inputMode="numeric"
              min="0"
              value={values.sellingPrice}
              onChange={set('sellingPrice')}
              placeholder="350"
              required
            />
          </Field>

          {isNew ? (
            <Field label="Stock Quantity" required>
              <input
                className={inputClass}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={values.stock}
                onChange={set('stock')}
                placeholder="12"
                required
              />
            </Field>
          ) : (
            <div>
              <span className="mb-1.5 block text-xs font-medium text-gray-700">
                Current Stock
              </span>

              <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                {initial.stock}
              </div>
            </div>
          )}
        </div>

        {!isNew && (
          <div className="rounded-lg bg-pink-50 p-3">
            <p className="text-xs leading-5 text-pink-800">
              Stock changes are made from the Stock screen so
              every adjustment is recorded in your stock history.
            </p>
          </div>
        )}

        <Field
          label="Buying Price (KSh), optional"
          hint="Used internally to help you understand your product costs."
        >
          <input
            className={inputClass}
            type="number"
            inputMode="numeric"
            min="0"
            value={values.buyingPrice}
            onChange={set('buyingPrice')}
            placeholder="150"
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-pink-100 bg-white p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Additional Information
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Optional information about the product.
          </p>
        </div>

        <Field label="Description, optional">
          <textarea
            className={inputClass}
            rows={4}
            value={values.description}
            onChange={set('description')}
            placeholder="Add a short description..."
          />
        </Field>
      </section>

      <div className="grid grid-cols-2 gap-3 pb-2">
        <button
          type="button"
          onClick={() => navigate('/owner/products')}
          disabled={saving}
          className="rounded-xl border border-pink-200 bg-white py-3 text-sm font-medium text-pink-700 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-pink-600 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
