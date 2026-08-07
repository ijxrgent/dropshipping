'use client'

import Link from 'next/link'
import {
  Bell,
  Package,
  ShoppingCart,
  Star,
  Tag,
  AlertTriangle,
} from 'lucide-react'

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    body: string
    isRead: boolean
    link: string | null
    createdAt: string
  }
  onRead: (notificationId: string) => void
}

function getIcon(type: string) {
  switch (type) {
    case 'NEW_SALE':
      return <ShoppingCart size={18} />

    case 'ORDER_SHIPPED':
    case 'ORDER_DELIVERED':
      return <Package size={18} />

    case 'NEW_REVIEW':
      return <Star size={18} />

    case 'PRICE_DROP':
      return <Tag size={18} />

    case 'LOW_STOCK':
      return <AlertTriangle size={18} />

    default:
      return <Bell size={18} />
  }
}

function getTimeAgo(date: string) {
  const now = Date.now()
  const created = new Date(date).getTime()
  const difference = now - created

  const minutes = Math.floor(difference / 60000)

  if (minutes < 1) {
    return 'Ahora'
  }

  if (minutes < 60) {
    return `Hace ${minutes} min`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `Hace ${hours} h`
  }

  const days = Math.floor(hours / 24)

  if (days < 7) {
    return `Hace ${days} d`
  }

  return new Date(date).toLocaleDateString('es-CO')
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const content = (
    <div
      className={`flex gap-3 px-4 py-3 transition-colors ${
        notification.isRead
          ? 'bg-white hover:bg-gray-50'
          : 'bg-blue-50 hover:bg-blue-100'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5 text-gray-600">
        {getIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">
            {notification.title}
          </p>

          {!notification.isRead && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
          )}
        </div>

        <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
          {notification.body}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {getTimeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  )

  if (!notification.link) {
    return (
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onRead(notification.id)}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      href={notification.link}
      className="block"
      onClick={() => onRead(notification.id)}
    >
      {content}
    </Link>
  )
}
