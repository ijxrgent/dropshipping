'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')

        if (!response.ok) {
          return
        }

        const data = await response.json()

        setNotifications(data.items)
        setUnreadCount(data.unreadCount)
      } catch (error) {
        console.error('Error al obtener notificaciones:', error)
      }
    }

    fetchNotifications()
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'read',
          notificationId,
        }),
      })

      if (!response.ok) {
        return
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      )

      setUnreadCount((current) => Math.max(0, current - 1))
    } catch (error) {
      console.error('Error al marcar notificación:', error)
    }
  }

  const handleReadAll = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'read-all',
        }),
      })

      if (!response.ok) {
        return
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )

      setUnreadCount(0)
    } catch (error) {
      console.error('Error al marcar notificaciones:', error)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell size={18} className="text-gray-600" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onRead={handleRead}
          onReadAll={handleReadAll}
        />
      )}
    </div>
  )
}
