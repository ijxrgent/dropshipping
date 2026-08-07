'use client'

import Link from 'next/link'
import NotificationItem from './NotificationItem'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  link: string | null
  createdAt: string
}

interface NotificationDropdownProps {
  notifications: Notification[]
  unreadCount: number
  onRead: (notificationId: string) => void
  onReadAll: () => void
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  onRead,
  onReadAll,
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Notificaciones
          </h2>

          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount} sin leer
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onReadAll}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Marcar todas
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={onRead}
            />
          ))
        ) : (
          <div className="px-6 py-10 text-center">
            <div className="text-3xl mb-2">🔔</div>

            <p className="text-sm font-medium text-gray-900">
              No tienes notificaciones
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Aquí aparecerán tus novedades.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200">
        <Link
          href="/notificaciones"
          className="block text-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </div>
  )
}
