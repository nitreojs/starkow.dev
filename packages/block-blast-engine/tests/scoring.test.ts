import { describe, expect, it } from 'vitest'

import { applyPlacement } from '../src/scoring'

describe('scoring', () => {
  it('awards 1 point per cell placed when no lines clear', () => {
    const r = applyPlacement({ cellsPlaced: 4, linesCleared: 0, cellsCleared: 0, prevStreak: 0 })
    expect(r.pointsGained).toBe(4)
    expect(r.newStreak).toBe(0)
  })

  it('awards cells + (10 * cellsCleared * linesCleared * (1 + streak)) for single line clear', () => {
    const r = applyPlacement({ cellsPlaced: 5, linesCleared: 1, cellsCleared: 8, prevStreak: 0 })
    // 5 placed + 10 * 8 * 1 * (1 + 1) = 5 + 160
    expect(r.pointsGained).toBe(165)
    expect(r.newStreak).toBe(1)
  })

  it('double-line clear gets a 2x multiplier', () => {
    const r = applyPlacement({ cellsPlaced: 5, linesCleared: 2, cellsCleared: 15, prevStreak: 0 })
    // 5 + 10 * 15 * 2 * (1 + 1) = 5 + 600
    expect(r.pointsGained).toBe(605)
    expect(r.newStreak).toBe(1)
  })

  it('extends streak on consecutive clears', () => {
    const r = applyPlacement({ cellsPlaced: 4, linesCleared: 1, cellsCleared: 8, prevStreak: 3 })
    // streak becomes 4; multiplier = 1 + 4 = 5
    // 4 + 10 * 8 * 1 * 5 = 4 + 400
    expect(r.pointsGained).toBe(404)
    expect(r.newStreak).toBe(4)
  })

  it('resets streak when no lines clear', () => {
    const r = applyPlacement({ cellsPlaced: 3, linesCleared: 0, cellsCleared: 0, prevStreak: 7 })
    expect(r.pointsGained).toBe(3)
    expect(r.newStreak).toBe(0)
  })
})
