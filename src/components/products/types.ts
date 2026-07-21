import { z } from 'zod'
import { ProductSchema } from './schemas'

// Importamos los tipos desde la ubicación original
import type {
  Product,
  Category,
} from '@/app/(main)/dashboard/seller/products/page'

export type ProductFormInput = z.input<typeof ProductSchema>
export type ProductForm = z.output<typeof ProductSchema>

export interface ImageItem {
  id: string
  url: string
  isNew: boolean
}

export interface ProductFormModalProps {
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}
