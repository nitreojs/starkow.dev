import { describe, expect, it } from 'vitest'

import { analyzeRun } from '../src/analysis'
import { Board } from '../src/board'
import { placementStats } from '../src/grid'
import { playFirstFit } from './play'

describe('analyzeRun', () => {
  it('flags careless play with legal, genuinely better alternatives', () => {
    let flagged = 0

    for (const seed of [3, 14, 15, 92, 65]) {
      const { moves } = playFirstFit(seed, 'classic', 60)
      const mistakes = analyzeRun({ seed, mode: 'classic', moves })

      expect(mistakes.length).toBeLessThanOrEqual(3)

      for (const m of mistakes) {
        const board = Board.fromSnapshot(m.board)
        expect(board.canPlace(m.piece, m.better.r, m.better.c)).toBe(true)

        const played = placementStats(m.board, m.piece, m.played.r, m.played.c)
        const better = placementStats(m.board, m.piece, m.better.r, m.better.c)
        expect(better.lines > played.lines || better.sealed < played.sealed).toBe(true)
      }

      flagged += mistakes.length
    }

    expect(flagged).toBeGreaterThan(0)
  })

  it('returns mistakes in move order', () => {
    const { moves } = playFirstFit(14, 'classic', 60)
    const indices = analyzeRun({ seed: 14, mode: 'classic', moves, limit: 5 }).map(m => m.moveIndex)

    expect(indices).toEqual([...indices].sort((a, b) => a - b))
  })
})
