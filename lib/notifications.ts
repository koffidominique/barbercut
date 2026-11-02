'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'appointment' | 'payment' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

const STORAGE_KEY = 'barbercuts_notifications_v1'

function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveNotifications(notifications: Notification[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    window.dispatchEvent(new Event('barbercuts_notifications_update'))
  } catch {
    // Ignore
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications())
  const [unreadCount, setUnreadCount] = useState(() =>
    loadNotifications().filter((n) => !n.read).length
  )

  // Synchronisation inter-onglets
  useEffect(() => {
    const handleUpdate = () => {
      const next = loadNotifications()
      setNotifications(next)
      setUnreadCount(next.filter((n) => !n.read).length)
    }
    window.addEventListener('barbercuts_notifications_update', handleUpdate)
    return () => window.removeEventListener('barbercuts_notifications_update', handleUpdate)
  }, [])

  const addNotification = useCallback(
    (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: Notification = {
        ...notif,
        id: 'notif-' + Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
      }
      const next = [newNotif, ...notifications].slice(0, 50) // garder les 50 plus récents
      setNotifications(next)
      setUnreadCount(next.filter((n) => !n.read).length)
      saveNotifications(next)
    },
    [notifications]
  )

  const markAsRead = useCallback((id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(next)
    setUnreadCount(next.filter((n) => !n.read).length)
    saveNotifications(next)
  }, [notifications])

  const markAllAsRead = useCallback(() => {
    const next = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(next)
    setUnreadCount(0)
    saveNotifications(next)
  }, [notifications])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  }
}
