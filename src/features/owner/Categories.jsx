import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  addCategory,
  deleteCategory,
  listCategoriesWithCounts,
  renameCategory,
} from '../../db/products'

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400'

function friendlyError(err) {
  if (err.name === 'ConstraintError') return 'A category with that name already exists.'
  return err.message || 'Something went wrong.'
}

export default function Categories() {
  const [text, setText] = useState('')
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  const categories = useLiveQuery(() => listCategoriesWithCounts(), [])

  async function run(action) {
    setError('')
    try {
      await action()
      return true
    } catch (err) {
      setError(friendlyError(err))
      return false
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (await run(() => addCategory({ name: newName }))) setNewName('')
  }

  async function handleRename(id) {
    if (await run(() => renameCategory(id, editName))) setEditingId(null)
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete "${category.name}"?`)) return
    await run(() => deleteCategory(category.id))
  }

  function startEditing(category) {
    setError('')
    setEditingId(category.id)
    setEditName(category.name)
  }

  const needle = text.trim().toLowerCase()
  const visible = (categories ?? []).filter((c) => c.name.toLowerCase().includes(needle))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-pink-700">Categories</h2>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className={inputClass}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
        />
        <button type="submit" className="shrink-0 rounded-xl bg-pink-600 px-4 text-sm text-white">
          Add
        </button>
      </form>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {categories && categories.length > 0 && (
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search categories..."
          className={inputClass}
        />
      )}

      {categories && categories.length === 0 && (
        <p className="text-sm text-gray-400">No categories yet. Add your first one above.</p>
      )}

      {visible.length > 0 && (
        <ul className="divide-y divide-pink-100 rounded-xl border border-pink-100 bg-white">
          {visible.map((c) => (
            <li key={c.id} className="px-4 py-3">
              {editingId === c.id ? (
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(c.id)}
                    className="shrink-0 rounded-xl bg-pink-600 px-3 text-sm text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="shrink-0 rounded-xl border border-pink-300 px-3 text-sm text-pink-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">
                      {c.productCount} {c.productCount === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => startEditing(c)} className="text-pink-600">
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={c.productCount > 0}
                      className="text-red-600 disabled:text-gray-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {categories && categories.length > 0 && visible.length === 0 && (
        <p className="text-sm text-gray-400">Nothing matches "{text}".</p>
      )}
    </div>
  )
}