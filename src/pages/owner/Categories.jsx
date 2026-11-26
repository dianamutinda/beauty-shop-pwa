
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Plus,
  Search,
  Tags,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

import {
  addCategory,
  deleteCategory,
  listCategoriesWithCounts,
  renameCategory,
} from '../../db/products'

const inputClass =
  'w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50'

function friendlyError(err) {
  if (err.name === 'ConstraintError') {
    return 'A category with that name already exists.'
  }

  return err.message || 'Something went wrong.'
}

function CategoryCard({
  category,
  editingId,
  editName,
  setEditName,
  onStartEditing,
  onRename,
  onCancelEditing,
  onDelete,
  renamingId,
  deletingId,
}) {
  const isEditing = editingId === category.id
  const isRenaming = renamingId === category.id
  const isDeleting = deletingId === category.id
  const hasProducts = category.productCount > 0

  if (isEditing) {
    return (
      <div className="rounded-xl border border-pink-200 bg-white p-4">
        <div className="space-y-3">
          <input
            className={inputClass}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            disabled={isRenaming}
            aria-label="Category name"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRename(category.id)}
              disabled={isRenaming}
              className="rounded-lg bg-pink-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {isRenaming ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={onCancelEditing}
              disabled={isRenaming}
              className="rounded-lg border border-pink-200 bg-white px-4 py-2 text-xs font-medium text-pink-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-pink-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
          <Tags size={18} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {category.name}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {category.productCount}{' '}
            {category.productCount === 1
              ? 'product'
              : 'products'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onStartEditing(category)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 text-xs font-medium text-pink-700 disabled:text-gray-300"
          >
            <Pencil size={14} strokeWidth={1.8} />
            Rename
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            disabled={hasProducts || isDeleting}
            title={
              hasProducts
                ? 'Remove products from this category before deleting it'
                : 'Delete category'
            }
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 disabled:text-gray-300"
          >
            <Trash2 size={14} strokeWidth={1.8} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteDialog({
  category,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!category) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-pink-100 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={18} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Delete category?
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                You are about to delete{' '}
                <span className="font-medium text-gray-700">
                  "{category.name}"
                </span>
                .
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs leading-5 text-gray-500">
            This cannot be undone. Categories with products
            assigned to them cannot be deleted.
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-xs font-medium text-pink-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Categories() {
  const [text, setText] = useState('')
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')

  const categories = useLiveQuery(
    () => listCategoriesWithCounts(),
    [refreshKey]
  )

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

  function refreshCategories() {
    setRefreshKey((value) => value + 1)
  }

  async function handleAdd(event) {
    event.preventDefault()

    const success = await run(() =>
      addCategory({
        name: newName,
      })
    )

    if (success) {
      setNewName('')
      refreshCategories()
    }
  }

  async function handleRename(id) {
    setRenamingId(id)
    setError('')

    const success = await run(() =>
      renameCategory(id, editName)
    )

    setRenamingId(null)

    if (success) {
      setEditingId(null)
      setEditName('')
      refreshCategories()
    }
  }

  function requestDelete(category) {
    setError('')
    setDeleteTarget(category)
  }

  function cancelDelete() {
    if (deletingId) return
    setDeleteTarget(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    const id = deleteTarget.id

    setDeletingId(id)
    setError('')

    const success = await run(() =>
      deleteCategory(id)
    )

    setDeletingId(null)

    if (success) {
      setDeleteTarget(null)
      refreshCategories()
    }
  }

  function startEditing(category) {
    setError('')
    setEditingId(category.id)
    setEditName(category.name)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditName('')
  }

  const needle = text.trim().toLowerCase()

  const visible = (categories ?? []).filter(
    (category) =>
      category.name.toLowerCase().includes(needle)
  )

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            to="/owner/more"
            className="font-medium text-pink-700"
          >
            More
          </Link>

          <span className="text-gray-300">/</span>

          <span className="text-gray-400">
            Categories
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-semibold text-pink-700">
            Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Organize your products into categories.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-pink-100 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
            <Plus size={18} strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800">
              Add Category
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Create a category for organizing products.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleAdd}
          className="mt-4 flex gap-2"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Hair Care"
            className={inputClass}
          />

          <button
            type="submit"
            className="shrink-0 rounded-lg bg-pink-600 px-4 py-2 text-xs font-medium text-white"
          >
            Add
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="relative">
          <Search
            size={17}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-xl border border-pink-100 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-50"
          />
        </div>
      )}

      {!categories && (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-400">
          Loading categories...
        </div>
      )}

      {categories && categories.length === 0 && (
        <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
            <Tags size={20} strokeWidth={1.8} />
          </div>

          <p className="mt-3 text-sm font-medium text-gray-700">
            No categories yet
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            Add your first category above to start
            organizing products.
          </p>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            {visible.length}{' '}
            {visible.length === 1
              ? 'category'
              : 'categories'}
          </p>

          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="text-xs font-medium text-pink-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              editingId={editingId}
              editName={editName}
              setEditName={setEditName}
              onStartEditing={startEditing}
              onRename={handleRename}
              onCancelEditing={cancelEditing}
              onDelete={requestDelete}
              renamingId={renamingId}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}

      {categories &&
        categories.length > 0 &&
        visible.length === 0 && (
          <div className="rounded-xl border border-pink-100 bg-white p-6 text-center">
            <p className="text-sm font-medium text-gray-700">
              No categories found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Nothing matches "{text}".
            </p>
          </div>
        )}

      <DeleteDialog
        category={deleteTarget}
        deleting={Boolean(deletingId)}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
