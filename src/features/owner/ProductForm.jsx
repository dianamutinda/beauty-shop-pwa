import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400'

function Field({ label, required, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

function validate(values, isNew) {
  if (!values.name.trim()) return 'Product name is required.'
  if (!values.sku.trim()) return 'SKU is required.'
  if (!values.categoryId) return 'Pick a category.'

  const price = Number(values.sellingPrice)
  if (values.sellingPrice === '' || !Number.isFinite(price) || price < 0) {
    return 'Enter a valid selling price.'
  }

  if (values.buyingPrice !== '') {
    const buying = Number(values.buyingPrice)
    if (!Number.isFinite(buying) || buying < 0) return 'Buying price must be a number.'
  }

  if (isNew) {
    const stock = Number(values.stock)
    if (values.stock === '' || !Number.isInteger(stock) || stock < 0) {
      return 'Stock must be a whole number, 0 or more.'
    }
  }
  return ''
}

export default function ProductForm({ initial, categories, onSubmit, submitLabel, isNew }) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  function set(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Field label="Product Name" required>
        <input className={inputClass} value={values.name} onChange={set('name')} placeholder="e.g. Face Cream" />
      </Field>

      <Field label="SKU / Code" required>
        <input className={inputClass} value={values.sku} onChange={set('sku')} placeholder="e.g. FC001" />
      </Field>

      <Field label="Category" required>
        <select className={inputClass} value={values.categoryId} onChange={set('categoryId')}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {categories.length === 0 && (
          <p className="text-xs text-gray-500">
            No categories yet. <Link to="/owner/categories" className="text-pink-600 underline">Add one first</Link>.
          </p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Selling Price (KSh)" required>
          <input
            className={inputClass}
            type="number"
            inputMode="numeric"
            min="0"
            value={values.sellingPrice}
            onChange={set('sellingPrice')}
            placeholder="e.g. 350"
          />
        </Field>

        {isNew ? (
          <Field label="Stock Quantity" required>
            <input
              className={inputClass}
              type="number"
              inputMode="numeric"
              min="0"
              value={values.stock}
              onChange={set('stock')}
              placeholder="e.g. 12"
            />
          </Field>
        ) : (
          <div className="space-y-1">
            <span className="text-sm text-gray-700">Stock</span>
            <p className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600">{initial.stock}</p>
          </div>
        )}
      </div>
      {!isNew && (
        <p className="text-xs text-gray-500">Stock changes are made from the Stock screen, so the history stays accurate.</p>
      )}

      <Field label="Buying Price (KSh), optional">
        <input
          className={inputClass}
          type="number"
          inputMode="numeric"
          min="0"
          value={values.buyingPrice}
          onChange={set('buyingPrice')}
          placeholder="e.g. 150"
        />
      </Field>

      <Field label="Description, optional">
        <textarea className={inputClass} rows={3} value={values.description} onChange={set('description')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/owner/products')}
          className="rounded-xl border border-pink-300 py-3 text-sm text-pink-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-pink-600 py-3 text-sm text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}