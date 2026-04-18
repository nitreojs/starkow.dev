import { atom } from 'jotai'
import { Notification } from './types'
import { getAdminKey } from './shared'

export const notifications$atom = atom<Notification[]>([])

export interface ReplyTarget {
  id: string
  quote: string
  preview: string
}

export const replyTarget$atom = atom<ReplyTarget | null>(null)

export const adminKey$atom = atom<string | null>(getAdminKey())
