'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setError(null)
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
    setError(null)
    setShowForm(true)
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)

    const url = editing
      ? `/api/admin/categories/${editing.id}`
      : '/api/admin/categories'

    const method = editing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), slug: slugify(name.trim()) }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    setShowForm(false)
    fetchCategories()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    fetchCategories()
  }

  return (
    <div>
      {/* Header - responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las categorías del marketplace
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {/* Formulario - responsivo */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            {editing ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 w-full">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Artesanías"
                autoFocus
                className={`w-full h-10 px-4 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
              {name && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Slug: <span className="font-mono">{slugify(name)}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2 sm:flex-shrink-0">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 sm:flex-none h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? 'Guardar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 sm:flex-none h-10 px-4 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla - convertida a cards en móvil */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No hay categorías aún. Crea la primera.
          </div>
        ) : (
          <>
            {/* Vista de tabla en pantallas medianas+ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
                      Nombre
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
                      Slug
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
                      Productos
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {cat.name}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">
                        {cat.slug}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {cat._count.products}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={cat._count.products > 0}
                            title={
                              cat._count.products > 0
                                ? 'Tiene productos asociados'
                                : 'Eliminar'
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de cards en móvil */}
            <div className="md:hidden divide-y divide-gray-100">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {cat.name}
                      </p>
                      <p className="font-mono text-xs text-gray-500 mt-1 truncate">
                        {cat.slug}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {cat._count.products} productos
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={cat._count.products > 0}
                        title={
                          cat._count.products > 0
                            ? 'Tiene productos asociados'
                            : 'Eliminar'
                        }
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
