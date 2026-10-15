import { describe, expect, it } from 'vitest'

import { PIECES, getPiece, defineCatalogue } from '../src/pieces'

describe('pieces', () => {
  it('every piece has a unique id', () => {
    const ids = PIECES.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
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

  it('every piece is orthogonally connected', () => {
    for (const p of PIECES) {
      const reached = [p.cells[0]!]

      for (let i = 0; i < reached.length; i++) {
        const [r, c] = reached[i]!
        for (const cell of p.cells) {
          const adjacent = Math.abs(cell[0] - r) + Math.abs(cell[1] - c) === 1
          if (adjacent && !reached.includes(cell)) reached.push(cell)
        }
      }

      expect(reached.length, p.id).toBe(p.cells.length)
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
})
