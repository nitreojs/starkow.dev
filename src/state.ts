import { atom } from 'jotai'
import { Notification } from './types'

export const notifications$atom = atom<Notification[]>([])
