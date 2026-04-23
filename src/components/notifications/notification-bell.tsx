"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NotificationItem {
  id: string
  type: string
  message: string
  read: boolean
  relatedId: string | null
  relatedType: string | null
  createdAt: string
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
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

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unread=true')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(Array.isArray(data) ? data.length : data.count ?? 0)
      }
    } catch {
      // Non-critical
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleOpen() {
    setOpen(!open)
    if (!open) {
      setLoading(true)
      try {
        const res = await fetch('/api/notifications?limit=5')
        if (res.ok) {
          const data = await res.json()
          setNotifications(Array.isArray(data) ? data : data.notifications ?? [])
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false)
      }
    }
  }

  async function markAllAsRead() {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' }).catch(() => {})
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function handleNotificationClick(n: NotificationItem) {
    if (!n.read) {
      fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }).catch(() => {})
      setNotifications(prev =>
        prev.map(item => (item.id === n.id ? { ...item, read: true } : item))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setOpen(false)
    const url = getNavigationUrl(n.relatedType, n.relatedId)
    if (url) router.push(url)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-[#00CFF8] hover:text-[#00b8e0] transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-center">
                <div className="h-5 w-5 border-2 border-gray-300 border-t-[#00CFF8] rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                    !n.read && 'bg-[#00CFF8]/[0.03]'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        n.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                      )}
                    >
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {getRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="shrink-0 mt-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#00CFF8]" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-center text-sm font-medium text-[#003964] hover:bg-gray-50 transition-colors"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
