import { prisma } from './prisma'

export async function createNotification({
  userId,
  type,
  message,
  relatedId,
  relatedType,
}: {
  userId: string
  type: string
  message: string
  relatedId?: string
  relatedType?: string
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      message,
      relatedId,
      relatedType,
    },
  })
}

export async function createNotificationForMany({
  userIds,
  type,
  message,
  relatedId,
  relatedType,
}: {
  userIds: string[]
  type: string
  message: string
  relatedId?: string
  relatedType?: string
}) {
  return prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      type,
      message,
      relatedId,
      relatedType,
    })),
  })
}
