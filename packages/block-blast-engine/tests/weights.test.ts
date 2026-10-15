import { describe, expect, it } from 'vitest'

import { PIECES } from '../src/pieces'
import { poolForScore, SCORE_BRACKETS } from '../src/weights'

const ids = (score: number) => poolForScore(score).pieces.map(p => p.id)

describe('weights', () => {
  it('switches bracket exactly at each threshold', () => {
    expect(ids(299)).toEqual(ids(0))
    expect(ids(300)).not.toEqual(ids(299))
    expect(ids(8399)).toEqual(ids(7600))
    expect(ids(8400)).toEqual(ids(1_000_000))
  })

  it('opens with simple shapes and unlocks awkward ones as the score grows', () => {
    const opening = ids(0)

    for (const awkward of ['S-h', 'S-v', 'Z-h', 'Z-v', 'T-n', 'T-w', 'L-small-se', 'L-small-sw']) {
      expect(opening, awkward).not.toContain(awkward)
      expect(ids(9000), awkward).toContain(awkward)
    }
  })

  it('every catalogue piece is dealt in at least one bracket', () => {
    const reachable = new Set(SCORE_BRACKETS.flatMap(ids))

    for (const piece of PIECES) expect(reachable.has(piece.id), piece.id).toBe(true)
  })

  it('pool totals match the sum of their weights', () => {
    for (const threshold of SCORE_BRACKETS) {
      const pool = poolForScore(threshold)
      expect(pool.total).toBe(pool.weights.reduce((a, b) => a + b, 0))
      expect(pool.weights.every(w => w > 0)).toBe(true)
    }
  })
})
