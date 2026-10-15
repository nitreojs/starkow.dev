import type { GameSnapshot, Move, Piece } from '@starkow.dev/block-blast-engine'

export type TrayIndex = 0 | 1 | 2

export type Ghost = {
  pieceId: string
  r: number
  c: number
  valid: boolean
} | null

export type ResumableSave = {
  engineVersion: string
  seed: number
  date: string | null
  snapshot: GameSnapshot
  cellPieceIds: (string | null)[]
  moveHistory: Move[]
}

export type AchievementId =
  | 'first-placement'
  | 'first-line-clear'
  | 'double-line-clear'
  | 'triple-line-clear'
  | 'place-3x3'
  | 'reach-1k'
  | 'reach-5k'
  | 'reach-10k'
  | 'survive-100'
  | 'survive-200'
  | 'streak-5'
  | 'streak-10'
  | 'limited-clear-bar'
  | 'daily-first'
  | 'daily-streak-3'
  | 'daily-streak-7'
  | 'daily-top-10'
  | 'board-clear'
  | 'board-clear-3'
  | 'quad-clear'
  | 'combo-30'
  | 'hold-5k'
  | 'clean-run'
  | 'terminal'

export type AchievementDef = {
  id: AchievementId
  title: string
  description: string
}

export type PieceForUi = Piece

export type DailyStart = {
  date: string
  seed: number
  engineVersion: string
  ranked: boolean
  attemptId: string | null
}

export type LeaderboardEntry = {
  id: string
  rank: number
  nickname: string
  score: number
  linesCleared: number
  maxCombo: number
  boardClears: number
  placements: number
  createdAt: number
  hidden?: boolean
}

export type DailyLeaderboard = {
  date: string
  total: number
  entries: LeaderboardEntry[]
  you: LeaderboardEntry | null
}

export type DailySubmitError =
  | 'invalid-nickname'
  | 'invalid-run'
  | 'invalid-moves'
  | 'not-found'
  | 'already-submitted'
  | 'unavailable'

export type DailySubmitOk = {
  ok: true
  entry: LeaderboardEntry
  rank: number
  total: number
}

export type DailySubmitResult = DailySubmitOk | { ok: false, error: DailySubmitError }
