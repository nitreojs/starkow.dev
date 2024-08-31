import { useAtomValue } from 'jotai'
import { FC } from 'preact/compat'

import { useInterval } from '@starkow.dev/hooks'

import { Notification } from '../../components'
import { Notification as NotificationData } from '../../types'
import { useNotifications } from '../../hooks'
import { notifications$atom } from '../../state'

export const NotificationsSection: FC = () => {
  const { setNotifications, deleteNotification } = useNotifications()

  const notifications = useAtomValue(notifications$atom)

  useInterval(() => {
    const dead: number[] = []

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i]

      if (Date.now() - notification.createdAt >= 5_000) {
        dead.push(i)
      }
    }

    setNotifications((current) => (
      current.map((found, i) => ({ ...found, isActive: !dead.includes(i) })) as NotificationData[]
    ))
  }, 500, [notifications])

  return (
    <div class='notification-container'>
      {
        notifications
          .sort((a, b) => b.createdAt - a.createdAt) // newest at the top
          .map(data => <Notification key={data.createdAt} deleteNotification={deleteNotification} data={data} />)
      }
    </div>
  )
}
