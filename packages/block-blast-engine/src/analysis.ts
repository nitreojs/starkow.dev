import type { BoardSnapshot } from './board'
import { applyMove, newGame } from './game'
import { fitsAt, placementStats, type Grid } from './grid'
import { COMBO_MISSES_ALLOWED } from './scoring'
import type { ModeId, Move, Piece } from './types'

export type Mistake = {
  readonly moveIndex: number
  readonly board: BoardSnapshot
  readonly piece: Piece
  readonly played: { readonly r: number, readonly c: number }
  readonly better: { readonly r: number, readonly c: number }
  readonly missedLines: number
  readonly extraSealedCells: number
  readonly comboLost: boolean
  readonly severity: number
}

export type AnalyzeInput = {
  readonly seed: number
  readonly mode: ModeId
  readonly moves: readonly Move[]
  readonly limit?: number
}

const LINE_WEIGHT = 3
const SEALED_WEIGHT = 1.5
const COMBO_LOST_WEIGHT = 3
const MIN_SEVERITY = 1
const DEFAULT_LIMIT = 3

const quality = (grid: Grid, piece: Piece, r: number, c: number): { value: number, lines: number, sealed: number } => {
  const stats = placementStats(grid, piece, r, c)

  return { value: LINE_WEIGHT * stats.lines - SEALED_WEIGHT * stats.sealed + stats.contact, lines: stats.lines, sealed: stats.sealed }
}

export const analyzeRun = (input: AnalyzeInput): Mistake[] => {
  const found: Mistake[] = []
  let state = newGame(input.mode, input.seed)

  input.moves.forEach((move, moveIndex) => {
    const piece = move.kind === 'place' ? state.tray[move.trayIndex] : null

    if (move.kind === 'place' && piece !== null && piece !== undefined) {
      const grid: Grid = state.board.snapshot()
      const played = quality(grid, piece, move.r, move.c)
      let best = { ...played, r: move.r, c: move.c }

      for (let r = 0; r + piece.height <= grid.size; r++) {
        for (let c = 0; c + piece.width <= grid.size; c++) {
          if (!fitsAt(grid, piece, r, c)) continue
          const candidate = quality(grid, piece, r, c)
          if (candidate.value > best.value) best = { ...candidate, r, c }
        }
      }

      const missedLines = Math.max(0, best.lines - played.lines)
      const extraSealedCells = Math.max(0, played.sealed - best.sealed)
      const comboLost = played.lines === 0 && best.lines > 0 && state.combo > 0 && state.comboMisses === COMBO_MISSES_ALLOWED
      const severity = best.value - played.value + (comboLost ? COMBO_LOST_WEIGHT : 0)

      if (severity >= MIN_SEVERITY && (missedLines > 0 || extraSealedCells > 0)) {
        found.push({
          moveIndex,
          board: state.board.snapshot(),
          piece,
          played: { r: move.r, c: move.c },
          better: { r: best.r, c: best.c },
          missedLines,
          extraSealedCells,
          comboLost,
          severity
        })
      }
    }

    const result = applyMove(state, move)
    if (result !== null) state = result.state
  })

  return found
    .sort((a, b) => b.severity - a.severity)
    .slice(0, input.limit ?? DEFAULT_LIMIT)
    .sort((a, b) => a.moveIndex - b.moveIndex)
}
