import { describe, expect, it } from 'vitest'

import { Board } from '../src/board'
import { PieceGenerator } from '../src/generator'
import { MODES } from '../src/modes'
import { applyPlacement } from '../src/scoring'
import { validateRun } from '../src/replay'
import type { Move } from '../src/types'

function playGreedy (seed: number, modeId: 'classic' | 'limited-moves' | 'big-board', maxMoves = 30) {
  const cfg = MODES[modeId]
  const board = new Board(cfg.boardSize)
  const gen = new PieceGenerator(seed, cfg.generator)
  const moves: Move[] = []
  let score = 0
  let streak = 0

  let tray = [...gen.nextTray(board)] as (ReturnType<typeof gen.nextTray>[number] | null)[]
  let consumed = 0

  while (moves.length < maxMoves) {
    if (consumed === 3) {
      tray = [...gen.nextTray(board)]
      consumed = 0
    }

    let placed = false
    for (let t = 0 as 0 | 1 | 2; t < 3; t = (t + 1) as 0 | 1 | 2) {
      const piece = tray[t]
      if (piece === null || piece === undefined) continue
      search:
      for (let r = 0; r + piece.height <= board.size; r++) {
        for (let c = 0; c + piece.width <= board.size; c++) {
          if (board.canPlace(piece, r, c)) {
            board.place(piece, r, c)
            const clear = board.clearFullLines()
            const s = applyPlacement({
              cellsPlaced: piece.cells.length,
              linesCleared: clear.rows.length + clear.cols.length,
              cellsCleared: clear.cellsCleared,
              prevStreak: streak
            })
            score += s.pointsGained
            streak = s.newStreak
            moves.push({ trayIndex: t, r, c })
            tray[t] = null
            consumed++
            placed = true
            break search
          }
        }
      }
      if (placed) break
    }
    if (!placed) break
  }

  return { moves, score }
}

describe('validateRun', () => {
  it('accepts a legitimate classic run and returns the same score', () => {
    const seed = 2024
    const { moves, score } = playGreedy(seed, 'classic', 20)

    const res = validateRun({ seed, mode: 'classic', engineVersion: '0.2.0', moves })
    expect(res.valid).toBe(true)
    if (res.valid) {
      expect(res.score).toBe(score)
      expect(res.placements).toBe(moves.length)
    }
  })

  it('rejects an illegal placement', () => {
    const seed = 2024
    const { moves } = playGreedy(seed, 'classic', 5)
    const tampered: Move[] = [...moves, { trayIndex: 0, r: -1, c: 0 }]

    const res = validateRun({ seed, mode: 'classic', engineVersion: '0.2.0', moves: tampered })
    expect(res.valid).toBe(false)
    if (!res.valid) expect(res.reason).toBe('illegal-placement')
  })

  it('rejects piece index outside 0-2', () => {
    const res = validateRun({
      seed: 1, mode: 'classic', engineVersion: '0.2.0',
      moves: [{ trayIndex: 5 as unknown as 0 | 1 | 2, r: 0, c: 0 }]
    })
    expect(res.valid).toBe(false)
    if (!res.valid) expect(res.reason).toBe('illegal-placement')
  })

  it('rejects unsupported engine version', () => {
    const res = validateRun({ seed: 1, mode: 'classic', engineVersion: '99.0.0', moves: [] })
    expect(res.valid).toBe(false)
    if (!res.valid) expect(res.reason).toBe('unsupported-engine')
  })
})
