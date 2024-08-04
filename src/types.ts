export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info'
}

export interface Notification {
  message: string
  title?: string
  isActive: boolean
  type: NotificationType
  createdAt: number
}
