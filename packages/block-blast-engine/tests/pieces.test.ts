import { describe, expect, it } from 'vitest'

import { PIECES, getPiece, defineCatalogue } from '../src/pieces'

describe('pieces', () => {
  it('every piece has a unique id', () => {
    const ids = PIECES.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every piece has at least one cell', () => {
    for (const p of PIECES) {
      expect(p.cells.length).toBeGreaterThan(0)
    }
  })

  it('piece cells fit within declared width/height', () => {
    for (const p of PIECES) {
      for (const [r, c] of p.cells) {
        expect(r).toBeGreaterThanOrEqual(0)
        expect(c).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(p.height)
        expect(c).toBeLessThan(p.width)
      }
    }
  })

  it('getPiece finds by id', () => {
    const twoByTwo = getPiece('2x2')
    expect(twoByTwo.cells).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]])
    expect(twoByTwo.width).toBe(2)
    expect(twoByTwo.height).toBe(2)
  })

  it('getPiece throws for unknown id', () => {
    expect(() => getPiece('does-not-exist')).toThrow()
  })

  it('defineCatalogue parses ascii matrices correctly', () => {
    const [plus] = defineCatalogue([
      { id: 'plus', shape: ['.X.', 'XXX', '.X.'] }
    ])!

    expect(plus!.width).toBe(3)
    expect(plus!.height).toBe(3)
    expect(plus!.cells).toEqual([
      [0, 1],
      [1, 0], [1, 1], [1, 2],
      [2, 1]
    ])
  })

  it('defineCatalogue rejects ragged shapes', () => {
    expect(() => defineCatalogue([
      { id: 'bad', shape: ['XX', 'X'] }
    ])).toThrow()
  })

  it('defineCatalogue rejects empty shape', () => {
    expect(() => defineCatalogue([
      { id: 'empty', shape: ['...'] }
    ])).toThrow()
  })

  it('catalogue contains expected shapes', () => {
    const ids = PIECES.map(p => p.id)

    expect(ids).toContain('1x2')
    expect(ids).toContain('2x2')
    expect(ids).toContain('3x3')
    expect(ids).toContain('1x5')
    expect(ids).toContain('5x1')
  })

  it('catalogue does not include single or plus', () => {
    const ids = PIECES.map(p => p.id)
    expect(ids).not.toContain('single')
    expect(ids).not.toContain('plus')
  })

  it('every piece has a positive weight', () => {
    for (const p of PIECES) {
      expect(p.weight).toBeGreaterThan(0)
    }
  })

  it('rectangle pieces are weighted heavier than diagonals', () => {
    const square = PIECES.find(p => p.id === '2x2')!
    const wideRect = PIECES.find(p => p.id === '2x3')!
    const diag = PIECES.find(p => p.id === 'diag-2-fwd')!
    const longDiag = PIECES.find(p => p.id === 'diag-3-fwd')!
    expect(square.weight).toBeGreaterThan(diag.weight * 5)
    expect(wideRect.weight).toBeGreaterThan(longDiag.weight * 5)
  })
})
