import { atom } from 'jotai'
import { Notification } from './types'

export const notifications$atom = atom<Notification[]>([])

export interface ReplyTarget {
  id: string
  quote: string
  preview: string
}

export const replyTarget$atom = atom<ReplyTarget | null>(null)
