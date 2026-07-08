//src/utils/profileConstants.ts
export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-600',
  PAID: 'text-blue-600',
  SHIPPED: 'text-purple-600',
  DELIVERED: 'text-green-600',
  CANCELLED: 'text-red-600',
}

export const ROLE_LABELS: Record<string, string> = {
  BUYER: 'Comprador',
  SELLER: 'Vendedor',
  ADMIN: 'Administrador',
}
