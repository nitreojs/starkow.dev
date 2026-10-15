import type { Piece } from './types'

export type Grid = {
  readonly size: number
  readonly cells: Uint8Array
}

export type PlacementStats = {
  readonly contact: number
  readonly sealed: number
  readonly lines: number
}

const SEALED_HOLE_PENALTY = 0.6
const LINE_FIT_BONUS = 0.5

export const coversCell = (piece: Piece, r: number, c: number, row: number, col: number): boolean =>
  piece.cells.some(([pr, pc]) => r + pr === row && c + pc === col)

export const fitsAt = (grid: Grid, piece: Piece, r: number, c: number): boolean => {
  if (r < 0 || c < 0 || r + piece.height > grid.size || c + piece.width > grid.size) return false

  for (const [dr, dc] of piece.cells) {
    if (grid.cells[(r + dr) * grid.size + (c + dc)] !== 0) return false
  }

  return true
}

export const placeAndClear = (grid: Grid, piece: Piece, r: number, c: number): Grid => {
  const { size } = grid
  const cells = new Uint8Array(grid.cells)

  for (const [dr, dc] of piece.cells) cells[(r + dr) * size + (c + dc)] = 1

  const fullRows: number[] = []
  const fullCols: number[] = []

  for (let i = 0; i < size; i++) {
    let rowFull = true
    let colFull = true
    for (let j = 0; j < size; j++) {
      if (cells[i * size + j] === 0) rowFull = false
      if (cells[j * size + i] === 0) colFull = false
    }
    if (rowFull) fullRows.push(i)
    if (colFull) fullCols.push(i)
  }

  for (const row of fullRows) cells.fill(0, row * size, row * size + size)
  for (const col of fullCols) for (let row = 0; row < size; row++) cells[row * size + col] = 0

  return { size, cells }
}

export const completedLines = (grid: Grid, piece: Piece, r: number, c: number): number => {
  const { size, cells } = grid
  const rows = new Set(piece.cells.map(([dr]) => r + dr))
  const cols = new Set(piece.cells.map(([, dc]) => c + dc))
  let lines = 0

  for (const row of rows) {
    let full = true
    for (let j = 0; j < size && full; j++) full = cells[row * size + j] !== 0 || coversCell(piece, r, c, row, j)
    if (full) lines++
  }

  for (const col of cols) {
    let full = true
    for (let j = 0; j < size && full; j++) full = cells[j * size + col] !== 0 || coversCell(piece, r, c, j, col)
    if (full) lines++
  }

  return lines
}

export const placementStats = (grid: Grid, piece: Piece, r: number, c: number): PlacementStats => {
  const { size, cells } = grid
  const blocked = (row: number, col: number): boolean =>
    row < 0 || col < 0 || row >= size || col >= size || cells[row * size + col] !== 0 || coversCell(piece, r, c, row, col)
  let edges = 0
  let touching = 0
  let sealed = 0

  for (const [dr, dc] of piece.cells) {
    for (const [nr, nc] of [[r + dr - 1, c + dc], [r + dr + 1, c + dc], [r + dr, c + dc - 1], [r + dr, c + dc + 1]] as const) {
      if (coversCell(piece, r, c, nr, nc)) continue
      edges++
      if (blocked(nr, nc)) {
        touching++
      } else if (blocked(nr - 1, nc) && blocked(nr + 1, nc) && blocked(nr, nc - 1) && blocked(nr, nc + 1)) {
        sealed++
      }
    }
  }

  return { contact: touching / edges, sealed, lines: completedLines(grid, piece, r, c) }
}

export const placementFit = (grid: Grid, piece: Piece, r: number, c: number): number => {
  const stats = placementStats(grid, piece, r, c)

  return stats.contact - SEALED_HOLE_PENALTY * stats.sealed + LINE_FIT_BONUS * Math.min(stats.lines, 2)
}
