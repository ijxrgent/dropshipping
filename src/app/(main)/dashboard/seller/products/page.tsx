'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Package,
} from 'lucide-react'
import ProductFormModal from '@/components/products/ProductFormModal'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

export interface ProductImage {
  id: string
  url: string
  order: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  isPublished: boolean
  categoryId: string
  category: { id: string; name: string }
  images: ProductImage[]
}

export interface Category {
  id: string
  name: string
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)

    const res = await fetch(`/api/seller/products?${params}`)
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }, [search])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timeout)
  }, [fetchProducts])

  function openCreate() {
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setShowModal(true)
  }

  async function handleTogglePublish(product: Product) {
    setUpdatingId(product.id)
    await fetch(`/api/seller/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !product.isPublished }),
    })
    await fetchProducts()
    setUpdatingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.'))
      return
    setUpdatingId(id)
    await fetch(`/api/seller/products/${id}`, { method: 'DELETE' })
    await fetchProducts()
    setUpdatingId(null)
  }

  function handleSaved() {
    setShowModal(false)
    fetchProducts()
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona el catálogo de tu tienda
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Package size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Aún no tienes productos</p>
          <button
            onClick={openCreate}
            className="mt-3 text-sm font-medium text-teal-600 hover:underline"
          >
            Crea tu primer producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const cover = product.images[0]?.url
            return (
              <div
                key={product.id}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-opacity ${
                  !product.isPublished ? 'opacity-60' : ''
                }`}
              >
                {/* Imagen */}
                <div className="relative h-40 bg-gray-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={withCloudinaryTransform(cover)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={28} className="text-gray-300" />
                    </div>
                  )}
                  <span
                    className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      product.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {product.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-teal-600 font-medium mb-0.5">
                    {product.category.name}
                  </p>
                  <p className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 mb-3">
                    <p className="text-sm font-bold text-gray-900">
                      ${product.price.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: {product.stock}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    <button
                      onClick={() => handleTogglePublish(product)}
                      disabled={updatingId === product.id}
                      title={product.isPublished ? 'Despublicar' : 'Publicar'}
                      className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
                    >
                      {updatingId === product.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : product.isPublished ? (
                        <EyeOff size={13} />
                      ) : (
                        <Eye size={13} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={updatingId === product.id}
                      title="Eliminar"
                      className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de creación/edición */}
      {showModal && (
        <ProductFormModal
          product={editing}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
