import { useFormContext, useWatch } from 'react-hook-form'
import { Tag } from 'lucide-react'
import { ProductFormInput } from './types'
import { FieldErrors } from 'react-hook-form'

interface PriceSectionProps {
  errors: FieldErrors<ProductFormInput>
}

export function PriceSection({ errors }: PriceSectionProps) {
  const { control, register, setValue, getValues } =
    useFormContext<ProductFormInput>()
  const hasDiscount = useWatch({
    control,
    name: 'hasDiscount',
  })

  const originalPrice = useWatch({
    control,
    name: 'originalPrice',
  })

  const discount = Number(
    useWatch({
      control,
      name: 'discount',
    }) ?? 0
  )

  // Debug: Ver qué está pasando
  console.log('hasDiscount:', hasDiscount)

  const calculateFinalPrice = () => {
    const price = Number(originalPrice)
    const disc = Number(discount)

    if (price > 0 && hasDiscount && disc > 0 && disc < 100) {
      return Math.round(price * (1 - disc / 100))
    } else if (price > 0) {
      return price
    }
    return null
  }

  const finalPrice = calculateFinalPrice()

  // Función de toggle mejorada
  const handleToggle = () => {
    const currentValue = getValues('hasDiscount')
    console.log('Valor actual:', currentValue)
    console.log('Nuevo valor:', !currentValue)

    setValue('hasDiscount', !currentValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })

    if (currentValue) {
      setValue('discount', 0)
    }
    console.log('getValues después:', getValues('hasDiscount'))
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {hasDiscount ? 'Precio original (COP)' : 'Precio (COP)'}
          </label>
          <input
            type="number"
            placeholder="50000"
            {...register('originalPrice')}
            className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
              errors.originalPrice
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          {errors.originalPrice && (
            <p className="mt-1 text-xs text-red-600">
              {errors.originalPrice.message}
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
            <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              ¿Producto en oferta?
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
              hasDiscount ? 'bg-teal-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                hasDiscount ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {hasDiscount && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Porcentaje de descuento (%)
              </label>
              <input
                type="number"
                min={1}
                max={99}
                placeholder="20"
                {...register('discount')}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            {finalPrice !== null &&
              Number(originalPrice) > 0 &&
              Number(discount) > 0 && (
                <div className="bg-white rounded-lg p-3 border border-teal-200">
                  <p className="text-xs text-gray-500 mb-1">
                    El comprador verá:
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-600">
                      ${finalPrice.toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ${Number(originalPrice).toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">
                      -{discount}%
                    </span>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </>
  )
}
