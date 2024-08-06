import clsx from 'clsx'
import type { Notification as NotificationData } from '../../types'
import { FC } from 'preact/compat'

import './style.css'

interface NotificationProps {
  data: NotificationData
  deleteNotification: (notification: NotificationData) => void
}

export const Notification: FC<NotificationProps> = ({ deleteNotification, data }) => {
  const title = data.title ?? data.type

  return (
    <div
      class={clsx('notification', `notification-${data.type}`)}
      data-active={data.isActive}
      onAnimationEnd={() => deleteNotification(data)}
    >
      <p class='notification-title'>{title}</p>
      <p class='notification-content'>{data.message}</p>

      <div class='notification-close' onClick={() => deleteNotification(data)}>
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-x'>
          <line x1='18' y1='6' x2='6' y2='18'></line>
          <line x1='6' y1='6' x2='18' y2='18'></line>
        </svg>
      </div>
    </div>
  )
}