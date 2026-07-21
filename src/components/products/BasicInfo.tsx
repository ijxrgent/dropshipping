import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ProductFormInput } from './types'
import { Category } from '@/app/(main)/dashboard/seller/products/page'

interface BasicInfoProps {
  categories: Category[]
  errors: FieldErrors<ProductFormInput>
  register: UseFormRegister<ProductFormInput>
}

export function BasicInfo({ categories, errors, register }: BasicInfoProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nombre
        </label>
        <input
          type="text"
          placeholder="Ej: Mochila tejida a mano"
          {...register('name')}
          className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
            errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Categoría
        </label>
        <select
          {...register('categoryId')}
          className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
            errors.categoryId ? 'border-red-400 bg-red-50' : 'border-gray-300'
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
    </>
  )
}
