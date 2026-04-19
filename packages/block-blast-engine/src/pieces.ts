import type { Cell, Piece } from './types'

type CatalogueEntry = { id: string, shape: readonly string[], weight?: number }

const DEFAULT_WEIGHT = 1

export const defineCatalogue = (entries: readonly CatalogueEntry[]): readonly Piece[] => {
  const pieces: Piece[] = []

  for (const { id, shape, weight } of entries) {
    if (shape.length === 0) {
      throw new Error(`piece '${id}' has no rows`)
    }

    const width = shape[0]!.length
    const cells: Cell[] = []

    for (let r = 0; r < shape.length; r++) {
      const row = shape[r]!
      if (row.length !== width) {
        throw new Error(`piece '${id}' has ragged row at index ${r}`)
      }
      for (let c = 0; c < row.length; c++) {
        const ch = row[c]!
        if (ch === 'X') {
          cells.push([r, c])
        } else if (ch !== '.') {
          throw new Error(`piece '${id}' row ${r} has invalid char '${ch}' (expected X or .)`)
        }
      }
    }

    if (cells.length === 0) {
      throw new Error(`piece '${id}' has no filled cells`)
    }

    pieces.push({ id, cells, width, height: shape.length, weight: weight ?? DEFAULT_WEIGHT })
  }

  return pieces
}

export const PIECES: readonly Piece[] = defineCatalogue([
  { id: '1x2', shape: ['XX'],                     weight: 3 },
  { id: '1x3', shape: ['XXX'],                    weight: 4 },
  { id: '1x4', shape: ['XXXX'],                   weight: 2 },
  { id: '1x5', shape: ['XXXXX'],                  weight: 1.5 },

  { id: '2x1', shape: ['X', 'X'],                 weight: 3 },
  { id: '3x1', shape: ['X', 'X', 'X'],            weight: 4 },
  { id: '4x1', shape: ['X', 'X', 'X', 'X'],       weight: 2 },
  { id: '5x1', shape: ['X', 'X', 'X', 'X', 'X'],  weight: 1.5 },

  { id: '2x2', shape: ['XX', 'XX'],               weight: 6 },
  { id: '3x3', shape: ['XXX', 'XXX', 'XXX'],      weight: 4 },

  { id: '2x3', shape: ['XXX', 'XXX'],             weight: 4 },
  { id: '3x2', shape: ['XX', 'XX', 'XX'],         weight: 4 },

  // 3-cell small L corners (rare — usually leave awkward holes)
  { id: 'L-small-ne', shape: ['XX', 'X.'],        weight: 0.4 },
  { id: 'L-small-nw', shape: ['XX', '.X'],        weight: 0.4 },
  { id: 'L-small-se', shape: ['X.', 'XX'],        weight: 0.4 },
  { id: 'L-small-sw', shape: ['.X', 'XX'],        weight: 0.4 },

  // 4-cell big L
  { id: 'L-big-ne', shape: ['XX', 'X.', 'X.'],    weight: 2 },
  { id: 'L-big-nw', shape: ['XX', '.X', '.X'],    weight: 2 },
  { id: 'L-big-se', shape: ['X.', 'X.', 'XX'],    weight: 2 },
  { id: 'L-big-sw', shape: ['.X', '.X', 'XX'],    weight: 2 },

  // 4-cell big J
  { id: 'J-big-ne', shape: ['XXX', 'X..'],        weight: 2 },
  { id: 'J-big-nw', shape: ['XXX', '..X'],        weight: 2 },
  { id: 'J-big-se', shape: ['X..', 'XXX'],        weight: 2 },
  { id: 'J-big-sw', shape: ['..X', 'XXX'],        weight: 2 },

  { id: 'T-n', shape: ['XXX', '.X.'],             weight: 1 },
  { id: 'T-e', shape: ['.X', 'XX', '.X'],         weight: 1 },
  { id: 'T-s', shape: ['.X.', 'XXX'],             weight: 1 },
  { id: 'T-w', shape: ['X.', 'XX', 'X.'],         weight: 1 },

  { id: 'S-h', shape: ['.XX', 'XX.'],             weight: 0.7 },
  { id: 'S-v', shape: ['X.', 'XX', '.X'],         weight: 0.7 },
  { id: 'Z-h', shape: ['XX.', '.XX'],             weight: 0.7 },
  { id: 'Z-v', shape: ['.X', 'XX', 'X.'],         weight: 0.7 },

  // pure diagonals (very rare — leave isolated cells everywhere)
  { id: 'diag-2-fwd', shape: ['.X', 'X.'],        weight: 0.2 },
  { id: 'diag-2-bwd', shape: ['X.', '.X'],        weight: 0.2 },
  { id: 'diag-3-fwd', shape: ['..X', '.X.', 'X..'], weight: 0.15 },
  { id: 'diag-3-bwd', shape: ['X..', '.X.', '..X'], weight: 0.15 }
])

const PIECE_BY_ID = new Map(PIECES.map(p => [p.id, p]))

export const getPiece = (id: string): Piece => {
  const p = PIECE_BY_ID.get(id)
  if (p === undefined) {
    throw new Error(`unknown piece id '${id}'`)
  }
  return p
}
