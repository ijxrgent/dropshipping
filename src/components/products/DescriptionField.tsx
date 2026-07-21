import { UseFormRegister } from 'react-hook-form'
import { ProductFormInput } from './types'

interface DescriptionFieldProps {
  register: UseFormRegister<ProductFormInput>
}

export function DescriptionField({ register }: DescriptionFieldProps) {
  return (
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
  )
}
