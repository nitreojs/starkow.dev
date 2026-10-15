import { describe, expect, it } from 'vitest'

import { applyPlacement, type PlacementInput } from '../src/scoring'

const place = (overrides: Partial<PlacementInput>) => applyPlacement({
  cellsPlaced: 4,
  linesCleared: 0,
  boardCleared: false,
  combo: 0,
  comboMisses: 0,
  ...overrides
})

describe('scoring', () => {
  it('awards one point per placed cell when nothing clears', () => {
    expect(place({ cellsPlaced: 5 }).pointsGained).toBe(5)
  })

  it('scores a single line as 10 × the combo it creates', () => {
    expect(place({ linesCleared: 1 }).pointsGained).toBe(4 + 10)
    expect(place({ linesCleared: 1, combo: 3 }).pointsGained).toBe(4 + 40)
  })

  it('scores n ≥ 2 lines as 10 × combo × n × (n − 1)', () => {
    expect(place({ linesCleared: 2 }).pointsGained).toBe(4 + 20)
    expect(place({ linesCleared: 3, combo: 1 }).pointsGained).toBe(4 + 120)
    expect(place({ linesCleared: 4, combo: 4 }).pointsGained).toBe(4 + 600)
  })

  it('adds the board-clear bonus on top of the line score', () => {
    expect(place({ linesCleared: 2, boardCleared: true }).pointsGained).toBe(4 + 20 + 300)
  })

  it('keeps the combo through two placements without a clear', () => {
    const first = place({ combo: 5 })
    const second = place({ combo: first.combo, comboMisses: first.comboMisses })

    expect(second.combo).toBe(5)
    expect(second.comboMisses).toBe(2)
  })

  it('breaks the combo on the third placement in a row without a clear', () => {
    const broken = place({ combo: 5, comboMisses: 2 })

    expect(broken.combo).toBe(0)
    expect(broken.comboMisses).toBe(0)
  })

  it('a clear inside the grace window continues the combo and resets the misses', () => {
    const resumed = place({ linesCleared: 1, combo: 5, comboMisses: 2 })

    expect(resumed.combo).toBe(6)
    expect(resumed.comboMisses).toBe(0)
    expect(resumed.pointsGained).toBe(4 + 60)
  })
})
