import type { ModeId, Piece } from '@starkow.dev/block-blast-engine'

export type TrayIndex = 0 | 1 | 2

export type Ghost = {
  pieceId: string
  r: number
  c: number
  valid: boolean
} | null

export type ResumableSave = {
  mode: ModeId
  seed: number
  rngState: { s: number }
  boardCells: number[]
  boardSize: number
  cellPieceIds: (string | null)[]
  tray: (string | null)[]
  score: number
  streak: number
  movesMade: number
  moveHistory: { trayIndex: TrayIndex, r: number, c: number }[]
  engineVersion: string
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

export type AchievementDef = {
  id: AchievementId
  title: string
  description: string
}

export type PieceForUi = Piece
