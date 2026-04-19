import { describe, expect, it } from 'vitest'

import { Board } from '../src/board'
import { getPiece } from '../src/pieces'

describe('board', () => {
  it('is empty on creation', () => {
    const b = new Board(8)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        expect(b.get(r, c)).toBe(0)
      }
    }
  })

  it('canPlace returns true on empty board', () => {
    const b = new Board(8)
    expect(b.canPlace(getPiece('2x2'), 0, 0)).toBe(true)
    expect(b.canPlace(getPiece('2x2'), 6, 6)).toBe(true)
  })

  it('canPlace rejects out-of-bounds placements', () => {
    const b = new Board(8)
    expect(b.canPlace(getPiece('2x2'), 7, 7)).toBe(false)
    expect(b.canPlace(getPiece('2x2'), -1, 0)).toBe(false)
    expect(b.canPlace(getPiece('2x2'), 0, -1)).toBe(false)
  })

  it('place fills cells', () => {
    const b = new Board(8)
    b.place(getPiece('2x2'), 0, 0)
    expect(b.get(0, 0)).toBe(1)
    expect(b.get(0, 1)).toBe(1)
    expect(b.get(1, 0)).toBe(1)
    expect(b.get(1, 1)).toBe(1)
    expect(b.get(2, 0)).toBe(0)
  })

  it('canPlace rejects when cells overlap', () => {
    const b = new Board(8)
    b.place(getPiece('2x2'), 0, 0)
    expect(b.canPlace(getPiece('2x2'), 0, 0)).toBe(false)
    expect(b.canPlace(getPiece('1x2'), 0, 0)).toBe(false)
    expect(b.canPlace(getPiece('1x2'), 5, 5)).toBe(true)
  })

  it('clearFullLines clears a full row', () => {
    const b = new Board(8)
    for (let c = 0; c < 8; c++) b.setCell(3, c, 1)

    const res = b.clearFullLines()
    expect(res.rows).toEqual([3])
    expect(res.cols).toEqual([])
    expect(res.cellsCleared).toBe(8)
    for (let c = 0; c < 8; c++) expect(b.get(3, c)).toBe(0)
  })

  it('clearFullLines clears a full column', () => {
    const b = new Board(8)
    for (let r = 0; r < 8; r++) b.setCell(r, 5, 1)

    const res = b.clearFullLines()
    expect(res.rows).toEqual([])
    expect(res.cols).toEqual([5])
    expect(res.cellsCleared).toBe(8)
  })

  it('clearFullLines clears intersecting row and column without double-counting', () => {
    const b = new Board(8)
    for (let i = 0; i < 8; i++) {
      b.setCell(2, i, 1)
      b.setCell(i, 4, 1)
    }

    const res = b.clearFullLines()
    expect(res.rows).toEqual([2])
    expect(res.cols).toEqual([4])
    expect(res.cellsCleared).toBe(8 + 8 - 1)
  })

  it('isGameOver returns true when no tray piece fits', () => {
    const b = new Board(8)
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) b.setCell(r, c, 1)

    expect(b.isGameOver([getPiece('1x2'), null, null])).toBe(true)
  })

  it('isGameOver returns false when at least one tray piece fits', () => {
    const b = new Board(8)
    expect(b.isGameOver([getPiece('1x2'), null, null])).toBe(false)
  })

  it('isGameOver ignores null slots', () => {
    const b = new Board(8)
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) b.setCell(r, c, 1)
    expect(b.isGameOver([null, null, null])).toBe(false)
  })

  it('snapshot/restore round-trip', () => {
    const a = new Board(8)
    a.place(getPiece('3x3'), 2, 2)

    const snap = a.snapshot()
    const b = Board.fromSnapshot(snap)

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        expect(b.get(r, c)).toBe(a.get(r, c))
      }
    }
  })
})
