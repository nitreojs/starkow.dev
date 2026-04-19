import { describe, expect, it } from 'vitest'

import { createRng, serializeRng, hydrateRng } from '../src/rng'

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)

    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next())
    }
  })

  it('differs across seeds', () => {
    const a = createRng(1)
    const b = createRng(2)

    const va = Array.from({ length: 10 }, () => a.next())
    const vb = Array.from({ length: 10 }, () => b.next())

    expect(va).not.toEqual(vb)
  })

  it('serializes and hydrates preserving sequence', () => {
    const a = createRng(99)
    a.next(); a.next(); a.next()

    const state = serializeRng(a)
    const b = hydrateRng(state)

    for (let i = 0; i < 50; i++) {
      expect(b.next()).toBe(a.next())
    }
  })

  it('produces floats in [0, 1)', () => {
    const r = createRng(7)

    for (let i = 0; i < 1000; i++) {
      const v = r.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
