import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET — obtener notificaciones del usuario autenticado
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const userId = session.user.id

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    }),

    prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),
  ])

  return NextResponse.json({
    items: notifications,
    unreadCount,
  })
}

// PATCH — marcar notificaciones como leídas
export async function PATCH(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { action, notificationId } = body

  // Marcar una notificación como leída
  if (action === 'read') {
    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId es requerido' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      )
    }

    // Si ya estaba leída, no modificamos readAt
    if (notification.isRead) {
      return NextResponse.json(notification)
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json(updatedNotification)
  }

  // Marcar todas las notificaciones como leídas
  if (action === 'read-all') {
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
