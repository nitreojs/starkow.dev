import { useAtom } from 'jotai'

import { notifications$atom } from '../state'
import { Notification, NotificationType } from '../types'

export const useNotifications = () => {
  const [notifications, setNotifications] = useAtom(notifications$atom)

  const addNotification = (message: string, type: NotificationType = NotificationType.Info) => (
    setNotifications((current) => (
      [...current, { message, type, createdAt: Date.now(), isActive: true }]
    ))
  )

  const deleteNotification = (given: Notification) => (
    setNotifications((current) => (
      current.filter(found => found.createdAt !== given.createdAt)
    ))
  )

  return {
    notifications,
    addNotification,
    setNotifications,
    deleteNotification
  }
}
