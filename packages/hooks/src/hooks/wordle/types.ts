import type { GameStatus, Lang, Length, Mode, Row } from '@starkow.dev/wordle-engine'

export type UiStatus = GameStatus | 'loading'

export interface GameView {
  gameId: string
  mode: Mode
  lang: Lang
  length: Length
  attempts: number
  rows: Row[]
  status: GameStatus
  answer: string | null
  nextResetAt: string | null
  dailyIndex: number | null
  dailyDate: string | null
  replay: boolean
}

export interface GuessResponse {
  valid: true
  row: number
  mask: ('green' | 'yellow' | 'gray')[]
  status: GameStatus
  answer: string | null
}

export interface GuessRejection {
  valid: false
  reason: 'not-in-dictionary' | 'wrong-length' | 'game-over'
}

export interface StatsRecord {
  played: number
  won: number
  currentStreak: number
  bestStreak: number
  distribution: [number, number, number, number, number, number]
  lastWonDate: string | null
}

export const EMPTY_STATS: StatsRecord = {
  played: 0,
  won: 0,
  currentStreak: 0,
  bestStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
  lastWonDate: null
}
