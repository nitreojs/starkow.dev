import type { Content } from '../../components'

export interface ShoutboxAnswer {
  content: Content[]
  date: number
}

export interface ShoutboxReplyRef {
  id: string
  quote: string
}

export interface ShoutboxMessage {
  id: string
  text: string
  content?: Content[]
  date: number
  fingerprintHash?: string
  answers?: ShoutboxAnswer[]
  reactions?: Record<string, number>
  yourReactions?: string[]
  pinned?: boolean
  replyTo?: ShoutboxReplyRef
  adminPosted?: boolean
}

