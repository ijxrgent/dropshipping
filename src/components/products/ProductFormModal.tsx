'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, ImagePlus, Trash2 } from 'lucide-react'
import type {
  Product,
  Category,
} from '@/app/(main)/dashboard/seller/products/page'

const ProductSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(80),
  description: z.string().max(500).optional(),
  price: z.coerce.number().int().min(1000, 'El precio mínimo es $1.000 COP'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
})

// Tipo de ENTRADA: lo que el formulario maneja mientras el usuario escribe
// (price/stock llegan como string desde el <input>, antes de que Zod los convierta)
type ProductFormInput = z.input<typeof ProductSchema>

// Tipo de SALIDA: lo que resulta después de validar (price/stock ya son number)
type ProductForm = z.output<typeof ProductSchema>

interface ImageItem {
  id: string // id temporal o real
  url: string
  isNew: boolean
}

interface ProductFormModalProps {
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!product

  const [images, setImages] = useState<ImageItem[]>(
    product?.images.map((img) => ({
      id: img.id,
      url: img.url,
      isNew: false,
    })) ?? []
  )
  const [uploadingImages, setUploadingImages] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductForm>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
        }
      : { price: 0, stock: 0 },
  })

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    if (images.length + files.length > 6) {
      setServerError('Máximo 6 imágenes por producto')
      e.target.value = ''
      return
    }

    setUploadingImages(true)
    setServerError(null)

    try {
      const uploaded = await Promise.all(files.map(uploadToCloudinary))
      setImages((prev) => [
        ...prev,
        ...uploaded.map((url) => ({
          id: crypto.randomUUID(),
          url,
          isNew: true,
        })),
      ])
    } catch {
      setServerError('Error al subir una o más imágenes')
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )
    formData.append('folder', 'riohachamarket/products')

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!res.ok) throw new Error('Error al subir a Cloudinary')
    const data = await res.json()
    return data.secure_url as string
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  async function onSubmit(data: ProductForm) {
    setServerError(null)

    if (images.length === 0) {
      setServerError('Agrega al menos una imagen del producto')
      return
    }

    const url = isEditing
      ? `/api/seller/products/${product!.id}`
      : '/api/seller/products'
    const method = isEditing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        slug: slugify(data.name),
        images: images.map((img, index) => ({ url: img.url, order: index })),
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setServerError(json.error ?? 'Error al guardar el producto')
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-semibold text-gray-900">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 space-y-5"
        >
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos del producto{' '}
              <span className="text-gray-400 font-normal">(hasta 6)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={11} className="text-white" />
                  </button>
                </div>
              ))}

              {images.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <Loader2 size={16} className="text-gray-400 animate-spin" />
                  ) : (
                    <ImagePlus size={16} className="text-gray-400" />
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Ej: Mochila wayuu tejida a mano"
              {...register('name')}
              className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Categoría
            </label>
            <select
              {...register('categoryId')}
              className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                errors.categoryId
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Precio y stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Precio (COP)
              </label>
              <input
                type="number"
                placeholder="50000"
                {...register('price')}
                className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                  errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Stock disponible
              </label>
              <input
                type="number"
                placeholder="10"
                {...register('stock')}
                className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                  errors.stock ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción{' '}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Material, tamaño, cuidados..."
              {...register('description')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
