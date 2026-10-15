import { describe, expect, it } from 'vitest'

import { Board } from '../src/board'
import { PieceGenerator } from '../src/generator'
import { createRng } from '../src/rng'
import type { Piece } from '../src/types'
import { poolForScore } from '../src/weights'

const placements = (cells: Uint8Array, size: number, piece: Piece): [number, number][] => {
  const found: [number, number][] = []
  for (let r = 0; r + piece.height <= size; r++) {
    for (let c = 0; c + piece.width <= size; c++) {
      if (piece.cells.every(([dr, dc]) => cells[(r + dr) * size + c + dc] === 0)) found.push([r, c])
    }
  }
  return found
}

const placeWithClears = (cells: Uint8Array, size: number, piece: Piece, r: number, c: number): Uint8Array => {
  const board = new Board(size as 8 | 10)
  board.cells.set(cells)
  board.place(piece, r, c)
  board.clearFullLines()
  return board.cells
}

const solvable = (cells: Uint8Array, size: number, pieces: readonly Piece[]): boolean =>
  pieces.length === 0 || pieces.some((piece, i) => {
    const rest = pieces.filter((_, j) => j !== i)
    return placements(cells, size, piece).some(([r, c]) => solvable(placeWithClears(cells, size, piece, r, c), size, rest))
  })

const randomPlayBoards = (seed: number, trays: number): { board: Board, score: number, tray: readonly Piece[] }[] => {
  const rng = createRng(seed)
  const gen = new PieceGenerator(seed)
  const board = new Board(8)
  const seen: { board: Board, score: number, tray: readonly Piece[] }[] = []
  let score = 0

  for (let t = 0; t < trays; t++) {
    const tray = gen.nextTray(board, score)
    seen.push({ board: Board.fromSnapshot(board.snapshot()), score, tray })

    for (const piece of tray) {
      const options = placements(board.cells, 8, piece)
      if (options.length === 0) return seen
      const [r, c] = options[Math.floor(rng.next() * options.length)]!
      board.place(piece, r, c)
      const clear = board.clearFullLines()
      score += piece.cells.length + 10 * (clear.rows.length + clear.cols.length)
    }
  }

  return seen
}

describe('PieceGenerator', () => {
  it('is deterministic for the same seed and board sequence', () => {
    const a = new PieceGenerator(42)
    const b = new PieceGenerator(42)
    const board = new Board(8)

    for (let i = 0; i < 5; i++) {
      expect(a.nextTray(board, i * 400).map(p => p.id)).toEqual(b.nextTray(board, i * 400).map(p => p.id))
    }
  })

  it('resumes identically after serialize → hydrate', () => {
    const a = new PieceGenerator(7)
    const board = new Board(8)
    a.nextTray(board, 0)
    a.nextTray(board, 0)

    const resumed = PieceGenerator.hydrate(a.serialize())

    expect(resumed.nextTray(board, 1200).map(p => p.id)).toEqual(a.nextTray(board, 1200).map(p => p.id))
  })

  it('every dealt tray can be placed in full whenever the board has room for three singles', () => {
    let checked = 0

    for (let seed = 1; seed <= 40; seed++) {
      for (const { board, tray } of randomPlayBoards(seed * 101, 30)) {
        const empty = board.cells.filter(v => v === 0).length
        if (empty < 3) continue
        expect(solvable(board.cells, 8, tray), `seed ${seed}`).toBe(true)
        checked++
      }
    }

    expect(checked).toBeGreaterThan(200)
  })

  it('rarely deals a piece whose every placement seals off an empty cell', () => {
    const sealedCells = (cells: Uint8Array): number => {
      let sealed = 0
      for (let i = 0; i < 64; i++) {
        if (cells[i] !== 0) continue
        const r = Math.floor(i / 8)
        const c = i % 8
        const open = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
          .some(([nr, nc]) => nr! >= 0 && nc! >= 0 && nr! < 8 && nc! < 8 && cells[nr! * 8 + nc!] === 0)
        if (!open) sealed++
      }
      return sealed
    }

    let dealt = 0
    let awkward = 0

    for (let seed = 1; seed <= 40; seed++) {
      for (const { board, tray } of randomPlayBoards(seed * 37, 30)) {
        const before = sealedCells(board.cells)
        for (const piece of tray) {
          dealt++
          const cleanSpot = placements(board.cells, 8, piece).some(([r, c]) => sealedCells(placeWithClears(board.cells, 8, piece, r, c)) <= before)
          if (!cleanSpot) awkward++
        }
      }
    }

    expect(dealt).toBeGreaterThan(600)
    expect(awkward / dealt, `${awkward} of ${dealt}`).toBeLessThan(0.035)
  })

  it('usually deals a piece that finishes a nearly complete row', () => {
    const board = new Board(8)
    for (let c = 0; c < 7; c++) board.setCell(0, c, 1)

    let finishing = 0
    const runs = 300

    for (let seed = 1; seed <= runs; seed++) {
      const tray = new PieceGenerator(seed).nextTray(board, 0)
      const finishes = tray.some(piece => placements(board.cells, 8, piece).some(([r, c]) => {
        const after = placeWithClears(board.cells, 8, piece, r, c)
        return after[0 * 8 + 0] === 0
      }))
      if (finishes) finishing++
    }

    expect(finishing / runs).toBeGreaterThan(0.85)
  })

  it('deals only pieces from the current score bracket on an open board', () => {
    const board = new Board(8)

    for (const score of [0, 1000, 4000, 9000]) {
      const allowed = poolForScore(score).pieces.map(p => p.id)
      const gen = new PieceGenerator(score + 1)

      for (let i = 0; i < 100; i++) {
        for (const piece of gen.nextTray(board, score)) expect(allowed, `${piece.id} @ ${score}`).toContain(piece.id)
      }
    }
  })
})
