import { describe, expect, it } from 'vitest'

import { Board } from '../src/board'
import { PieceGenerator } from '../src/generator'
import { PIECES } from '../src/pieces'

describe('PieceGenerator / seeded-bag', () => {
  it('produces trays of exactly 3 pieces', () => {
    const gen = new PieceGenerator(123, 'seeded-bag')
    const b = new Board(8)
    const tray = gen.nextTray(b)
    expect(tray).toHaveLength(3)
    for (const p of tray) expect(p).toBeTruthy()
  })

  it('is deterministic for the same seed', () => {
    const gen1 = new PieceGenerator(42, 'seeded-bag')
    const gen2 = new PieceGenerator(42, 'seeded-bag')
    const b1 = new Board(8)
    const b2 = new Board(8)

    for (let i = 0; i < 5; i++) {
      const t1 = gen1.nextTray(b1)
      const t2 = gen2.nextTray(b2)
      expect(t1.map(p => p!.id)).toEqual(t2.map(p => p!.id))
    }
  })

  it('hydrates and resumes from serialized state', () => {
    const a = new PieceGenerator(7, 'seeded-bag')
    const b = new Board(8)
    a.nextTray(b); a.nextTray(b)

    const state = a.serialize()
    const c = PieceGenerator.hydrate(state, 'seeded-bag')

    const fromA = a.nextTray(b).map(p => p!.id)
    const fromC = c.nextTray(b).map(p => p!.id)
    expect(fromA).toEqual(fromC)
  })

  it('weighted distribution favours common rectangles over diagonals', () => {
    const gen = new PieceGenerator(123, 'seeded-bag')
    const b = new Board(8)
    const counts = new Map<string, number>()
    for (let i = 0; i < 400; i++) {
      for (const p of gen.nextTray(b)) {
        counts.set(p!.id, (counts.get(p!.id) ?? 0) + 1)
      }
    }
    const square2x2 = counts.get('2x2') ?? 0
    const diag = counts.get('diag-3-fwd') ?? 0
    expect(square2x2).toBeGreaterThan(diag * 8)
  })

  it('eventually draws every piece id given enough trays', () => {
    const gen = new PieceGenerator(1, 'seeded-bag')
    const b = new Board(8)
    const seen = new Set<string>()
    // weighted draws eventually cover the whole catalogue with high probability
    for (let i = 0; i < 1000; i++) {
      for (const p of gen.nextTray(b)) {
        if (p !== null) seen.add(p.id)
      }
    }
    expect(seen.size).toBe(PIECES.length)
  })
})

describe('PieceGenerator / solvability-aware', () => {
  it('produces trays where every piece individually fits on empty board', () => {
    const gen = new PieceGenerator(55, 'solvability-aware')
    const b = new Board(8)
    const tray = gen.nextTray(b)

    for (const p of tray) expect(b.hasAnyPlacement(p!)).toBe(true)
  })

  it('prefers trays that enable multi-line clears on a 2-line-pending board', () => {
    // setup a board where a 2x2 piece at (4,1) clears 2 lines simultaneously
    //   . . . . . . . .
    //   . x x x x x . .
    //   x x x x x x . .
    //   x . . x x x . .
    //   x . . x x x x x   <-- needs (4,1) (4,2)
    //   x . . x x x x x   <-- needs (5,1) (5,2)
    //   x . . . . . . .
    //   x . . . . . . .
    const b = new Board(8)
    const filled: Array<[number, number]> = [
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
      [3, 0], [3, 3], [3, 4], [3, 5],
      [4, 0], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
      [5, 0], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7],
      [6, 0],
      [7, 0]
    ]
    for (const [r, c] of filled) b.setCell(r, c, 1)

    // try multiple seeds — the algorithm should prefer trays containing 2x2 / 1x2 / 2x1 over Z/S/diag combos
    let traysWithRectangleHelper = 0
    const TRIALS = 20
    for (let seed = 0; seed < TRIALS; seed++) {
      const gen = new PieceGenerator(seed, 'solvability-aware')
      const tray = gen.nextTray(b)
      const ids = tray.map(p => p!.id)
      const helpful = ids.some(id => id === '2x2' || id === '1x2' || id === '2x1' || id === '1x3' || id === '3x1' || id === '2x3' || id === '3x2')
      if (helpful) traysWithRectangleHelper++
    }
    expect(traysWithRectangleHelper).toBeGreaterThanOrEqual(TRIALS * 0.85)
  })

  it('falls back gracefully when board is nearly full (1x2 gap)', () => {
    const b = new Board(8)
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) b.setCell(r, c, 1)
    // leave a 1x2 horizontal gap so at least a 1x2 piece fits
    b.setCell(0, 0, 0)
    b.setCell(0, 1, 0)

    const gen = new PieceGenerator(9, 'solvability-aware')
    const tray = gen.nextTray(b)

    let anyPlaceable = false
    for (const p of tray) {
      if (b.hasAnyPlacement(p!)) { anyPlaceable = true; break }
    }
    expect(anyPlaceable).toBe(true)
  })

  it('is deterministic given same seed + same board sequence', () => {
    const g1 = new PieceGenerator(77, 'solvability-aware')
    const g2 = new PieceGenerator(77, 'solvability-aware')
    const b1 = new Board(8)
    const b2 = new Board(8)
    for (let i = 0; i < 3; i++) {
      const t1 = g1.nextTray(b1)
      const t2 = g2.nextTray(b2)
      expect(t1.map(p => p!.id)).toEqual(t2.map(p => p!.id))
    }
  })
})
