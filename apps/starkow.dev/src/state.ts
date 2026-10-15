import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Notification } from './types'
import type { TrackData } from './sections/SpotifySection/types'
import { getAdminKey } from './shared'

export const notifications$atom = atom<Notification[]>([])

export interface ReplyTarget {
  id: string
  quote: string
  preview: string
}

export const replyTarget$atom = atom<ReplyTarget | null>(null)

export const adminKey$atom = atom<string | null>(getAdminKey())

export const nowPlaying$atom = atom<TrackData | null>(null)

export const ambientEnabled$atom = atomWithStorage('ambient:enabled', true, undefined, { getOnInit: true })
