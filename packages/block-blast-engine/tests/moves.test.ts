import { describe, expect, it } from 'vitest'

import { decodeMoves, encodeMoves } from '../src/moves'
import type { Move } from '../src/types'

describe('move encoding', () => {
  it('round-trips placements and holds on both board sizes', () => {
    for (const size of [8, 10] as const) {
      const moves: Move[] = [
        { kind: 'place', trayIndex: 0, r: 0, c: 0 },
        { kind: 'hold', trayIndex: 2 },
        { kind: 'place', trayIndex: 2, r: size - 1, c: size - 1 },
        { kind: 'place', trayIndex: 1, r: 3, c: size - 2 },
        { kind: 'hold', trayIndex: 0 }
      ]

      const encoded = encodeMoves(moves, size)

      expect(encoded).toMatch(/^[A-Za-z0-9_-]*$/)
      expect(encoded).toHaveLength(moves.length * 2)
      expect(decodeMoves(encoded, size)).toEqual(moves)
    }
  })

  it('rejects malformed input', () => {
    const outOfBoard = encodeMoves([{ kind: 'place', trayIndex: 0, r: 9, c: 9 }], 10)

    expect(decodeMoves('A', 8)).toBeNull()
    expect(decodeMoves('A*', 8)).toBeNull()
    expect(decodeMoves(outOfBoard, 8)).toBeNull()
    expect(decodeMoves('8A', 8)).toBeNull()
  })
})
