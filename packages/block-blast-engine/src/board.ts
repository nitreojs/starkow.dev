import type { BoardSize, ClearResult, Piece } from './types'

export type BoardSnapshot = { size: BoardSize, cells: Uint8Array }

export class Board {
  readonly size: BoardSize
  readonly cells: Uint8Array

  constructor (size: BoardSize) {
    this.size = size
    this.cells = new Uint8Array(size * size)
  }

  static fromSnapshot (snap: BoardSnapshot): Board {
    const b = new Board(snap.size)
    b.cells.set(snap.cells)
    return b
  }

  snapshot (): BoardSnapshot {
    return { size: this.size, cells: new Uint8Array(this.cells) }
  }

  get (r: number, c: number): number {
    return this.cells[r * this.size + c] ?? 0
  }

  setCell (r: number, c: number, v: 0 | 1): void {
    this.cells[r * this.size + c] = v
  }

  canPlace (piece: Piece, r: number, c: number): boolean {
    if (r < 0 || c < 0) return false
    if (r + piece.height > this.size) return false
    if (c + piece.width > this.size) return false

    for (const [dr, dc] of piece.cells) {
      if (this.get(r + dr, c + dc) !== 0) return false
    }

    return true
  }

  place (piece: Piece, r: number, c: number): void {
    for (const [dr, dc] of piece.cells) {
      this.setCell(r + dr, c + dc, 1)
    }
  }

  clearFullLines (): ClearResult {
    const rows: number[] = []
    const cols: number[] = []

    for (let r = 0; r < this.size; r++) {
      let full = true
      for (let c = 0; c < this.size; c++) {
        if (this.get(r, c) === 0) { full = false; break }
      }
      if (full) rows.push(r)
    }

    for (let c = 0; c < this.size; c++) {
      let full = true
      for (let r = 0; r < this.size; r++) {
        if (this.get(r, c) === 0) { full = false; break }
      }
      if (full) cols.push(c)
    }

    const cellsToClear = new Set<number>()
    for (const r of rows) {
      for (let c = 0; c < this.size; c++) cellsToClear.add(r * this.size + c)
    }
    for (const c of cols) {
      for (let r = 0; r < this.size; r++) cellsToClear.add(r * this.size + c)
    }

    for (const idx of cellsToClear) {
      this.cells[idx] = 0
    }

    return { rows, cols, cellsCleared: cellsToClear.size }
  }

  isGameOver (tray: readonly (Piece | null)[]): boolean {
    let hasAnyPiece = false
    for (const piece of tray) {
      if (piece === null) continue
      hasAnyPiece = true
      if (this.hasAnyPlacement(piece)) return false
    }
    return hasAnyPiece
  }

  hasAnyPlacement (piece: Piece): boolean {
    for (let r = 0; r + piece.height <= this.size; r++) {
      for (let c = 0; c + piece.width <= this.size; c++) {
        if (this.canPlace(piece, r, c)) return true
      }
    }
    return false
  }
}
