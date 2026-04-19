import { Board } from './board'
import { PieceGenerator } from './generator'
import { MODES } from './modes'
import { applyPlacement } from './scoring'
import type { ModeId, Move, Piece } from './types'

import { ENGINE_VERSION } from './version'

export type ValidateInput = {
  seed: number
  mode: ModeId
  engineVersion: string
  moves: readonly Move[]
}

export type ValidateOk = {
  valid: true
  score: number
  linesCleared: number
  placements: number
}

export type ValidateError = {
  valid: false
  reason:
    | 'illegal-placement'
    | 'piece-already-used'
    | 'over-move-limit'
    | 'unsupported-engine'
    | 'unknown-mode'
}

export type ValidateResult = ValidateOk | ValidateError

const SUPPORTED_VERSIONS: readonly string[] = [ENGINE_VERSION]

export const validateRun = (input: ValidateInput): ValidateResult => {
  if (!SUPPORTED_VERSIONS.includes(input.engineVersion)) {
    return { valid: false, reason: 'unsupported-engine' }
  }

  const mode = MODES[input.mode]
  if (mode === undefined) {
    return { valid: false, reason: 'unknown-mode' }
  }

  if (mode.maxMoves !== null && input.moves.length > mode.maxMoves) {
    return { valid: false, reason: 'over-move-limit' }
  }

  const board = new Board(mode.boardSize)
  const gen = new PieceGenerator(input.seed, mode.generator)

  let tray: (Piece | null)[] = [...gen.nextTray(board)]
  let consumed = 0

  let score = 0
  let streak = 0
  let totalLines = 0

  for (const move of input.moves) {
    if (consumed === 3) {
      tray = [...gen.nextTray(board)]
      consumed = 0
    }

    if (move.trayIndex < 0 || move.trayIndex > 2 || move.r < 0 || move.c < 0) {
      return { valid: false, reason: 'illegal-placement' }
    }

    const piece = tray[move.trayIndex]
    if (piece === null || piece === undefined) {
      return { valid: false, reason: 'piece-already-used' }
    }

    if (!board.canPlace(piece, move.r, move.c)) {
      return { valid: false, reason: 'illegal-placement' }
    }

    board.place(piece, move.r, move.c)
    const clear = board.clearFullLines()
    const step = applyPlacement({
      cellsPlaced: piece.cells.length,
      linesCleared: clear.rows.length + clear.cols.length,
      cellsCleared: clear.cellsCleared,
      prevStreak: streak
    })

    score += step.pointsGained
    streak = step.newStreak
    totalLines += clear.rows.length + clear.cols.length

    tray[move.trayIndex] = null
    consumed++
  }

  return { valid: true, score, linesCleared: totalLines, placements: input.moves.length }
}
