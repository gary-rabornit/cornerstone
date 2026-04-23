import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NotificationsClient } from '@/components/notifications/notifications-client'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = notifications.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <div>
      <NotificationsClient notifications={serialized} />
    </div>
  )
}
