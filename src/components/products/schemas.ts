import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(80),
  description: z.string().max(500).optional(),
  originalPrice: z.coerce
    .number()
    .int()
    .min(1000, 'El precio mínimo es $1.000 COP'),
  discount: z.coerce.number().int().min(0).max(99).optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  hasDiscount: z.boolean(),
})
