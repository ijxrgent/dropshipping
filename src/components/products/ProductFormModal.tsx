'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'

import { ProductSchema } from './schemas'
import { ProductFormInput, ProductFormModalProps } from './types'
import { useImageUpload } from './useImageUpload'
import { ImageUploader } from './ImageUploader'
import { BasicInfo } from './BasicInfo'
import { PriceSection } from './PriceSection'
import { DescriptionField } from './DescriptionField'

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
  const isEditing = !!product

  const methods = useForm<ProductFormInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? '',
          originalPrice: product.originalPrice ?? product.price,
          discount: product.discount ?? 0,
          stock: product.stock,
          categoryId: product.categoryId,
          hasDiscount: !!product.discount,
        }
      : { stock: 0, discount: 0, hasDiscount: false },
  })

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods

  const {
    images,
    uploadingImages,
    error: imageError,
    setError: setImageError,
    handleFilesSelected,
    removeImage,
  } = useImageUpload(
    product?.images.map((img) => ({
      id: img.id,
      url: img.url,
      isNew: false,
    })) ?? []
  )

  const onSubmit = async (data: ProductFormInput) => {
    setImageError(null)

    if (images.length === 0) {
      setImageError('Agrega al menos una imagen del producto')
      return
    }

    const originalPrice = Number(data.originalPrice)
    const discount = Number(data.discount ?? 0)

    const price =
      data.hasDiscount && data.discount
        ? Math.round(originalPrice * (1 - discount / 100))
        : originalPrice

    const url = isEditing
      ? `/api/seller/products/${product!.id}`
      : '/api/seller/products'
    const method = isEditing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        slug: slugify(data.name),
        description: data.description,
        price,
        originalPrice: data.hasDiscount ? originalPrice : null,
        discount: data.hasDiscount && data.discount ? discount : null,
        stock: Number(data.stock),
        categoryId: data.categoryId,
        images: images.map((img, index) => ({ url: img.url, order: index })),
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setImageError(json.error ?? 'Error al guardar el producto')
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

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="p-6 space-y-5"
          >
            {imageError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {imageError}
              </div>
            )}

            <ImageUploader
              images={images}
              uploadingImages={uploadingImages}
              onFilesSelected={handleFilesSelected}
              onRemoveImage={removeImage}
            />

            <BasicInfo
              categories={categories}
              errors={errors}
              register={methods.register}
            />

            <PriceSection errors={errors} />

            <DescriptionField register={methods.register} />

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
        </FormProvider>
      </div>
    </div>
  )
}
