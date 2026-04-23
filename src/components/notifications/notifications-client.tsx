"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  UserPlus,
  AlertCircle,
  MessageSquare,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  userId: string
  type: string
  message: string
  read: boolean
  relatedId: string | null
  relatedType: string | null
  createdAt: string
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'PROPOSAL_SIGNED':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'PROPOSAL_DECLINED':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'PROPOSAL_VIEWED':
      return <Eye className="h-5 w-5 text-blue-500" />
    case 'PROPOSAL_SENT':
      return <FileText className="h-5 w-5 text-purple-500" />
    case 'DEAL_WON':
      return <DollarSign className="h-5 w-5 text-green-500" />
    case 'DEAL_LOST':
      return <DollarSign className="h-5 w-5 text-red-500" />
    case 'APPROVAL_REQUEST':
      return <AlertCircle className="h-5 w-5 text-amber-500" />
    case 'APPROVAL_RESPONSE':
      return <MessageSquare className="h-5 w-5 text-blue-500" />
    case 'USER_ADDED':
      return <UserPlus className="h-5 w-5 text-[#625AED]" />
    default:
      return <Bell className="h-5 w-5 text-gray-400" />
  }
}

function getRelativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getDateGroup(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'Earlier This Week'
  return 'Older'
}

function getNavigationUrl(relatedType: string | null, relatedId: string | null): string | null {
  if (!relatedId || !relatedType) return null
  switch (relatedType) {
    case 'DEAL':
      return `/pipeline/${relatedId}`
    case 'PROPOSAL':
      return `/proposals/${relatedId}`
    default:
      return null
  }
}

export function NotificationsClient({ notifications: initialNotifications }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [markingAll, setMarkingAll] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.read).length

  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {}
    const order = ['Today', 'Yesterday', 'Earlier This Week', 'Older']

    for (const n of notifications) {
      const group = getDateGroup(n.createdAt)
      if (!groups[group]) groups[group] = []
      groups[group].push(n)
    }

    return order
      .filter(key => groups[key]?.length)
      .map(key => ({ label: key, items: groups[key] }))
  }, [notifications])

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {})
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  async function markAllAsRead() {
    setMarkingAll(true)
    await fetch('/api/notifications/mark-all-read', { method: 'POST' }).catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setMarkingAll(false)
  }

  function handleClick(notification: Notification) {
    if (!notification.read) markAsRead(notification.id)
    const url = getNavigationUrl(notification.relatedType, notification.relatedId)
    if (url) router.push(url)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllAsRead}
            loading={markingAll}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
          <p className="text-sm text-gray-500">
            When there is activity on your deals and proposals, you will see notifications here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {group.label}
              </h3>
              <Card className="divide-y divide-gray-50 overflow-hidden">
                {group.items.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors',
                      !notification.read && 'border-l-[3px] border-l-[#00CFF8] bg-[#00CFF8]/[0.02]'
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm leading-snug',
                          notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                        )}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-[#00CFF8]" />
                      </div>
                    )}
                  </button>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
