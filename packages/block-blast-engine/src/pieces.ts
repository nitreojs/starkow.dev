import type { Cell, Piece } from './types'

type CatalogueEntry = { id: string, shape: readonly string[] }

export const defineCatalogue = (entries: readonly CatalogueEntry[]): readonly Piece[] => {
  const pieces: Piece[] = []

  for (const { id, shape } of entries) {
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

    pieces.push({ id, cells, width, height: shape.length })
  }

  return pieces
}

export const PIECES: readonly Piece[] = defineCatalogue([
  { id: '1x1', shape: ['X'] },

  { id: '1x2', shape: ['XX'] },
  { id: '1x3', shape: ['XXX'] },
  { id: '1x4', shape: ['XXXX'] },
  { id: '1x5', shape: ['XXXXX'] },

  { id: '2x1', shape: ['X', 'X'] },
  { id: '3x1', shape: ['X', 'X', 'X'] },
  { id: '4x1', shape: ['X', 'X', 'X', 'X'] },
  { id: '5x1', shape: ['X', 'X', 'X', 'X', 'X'] },

  { id: '2x2', shape: ['XX', 'XX'] },
  { id: '3x3', shape: ['XXX', 'XXX', 'XXX'] },

  { id: 'L-small-ne', shape: ['XX', 'X.'] },
  { id: 'L-small-nw', shape: ['XX', '.X'] },
  { id: 'L-small-se', shape: ['X.', 'XX'] },
  { id: 'L-small-sw', shape: ['.X', 'XX'] },

  { id: 'L-big-ne', shape: ['XX', 'X.', 'X.'] },
  { id: 'L-big-sw', shape: ['.X', '.X', 'XX'] },
  { id: 'J-big-nw', shape: ['XXX', '..X'] },
  { id: 'J-big-se', shape: ['X..', 'XXX'] },

  { id: 'corner5-tl', shape: ['XXX', 'X..', 'X..'] },
  { id: 'corner5-tr', shape: ['XXX', '..X', '..X'] },
  { id: 'corner5-bl', shape: ['X..', 'X..', 'XXX'] },
  { id: 'corner5-br', shape: ['..X', '..X', 'XXX'] },

  { id: 'T-n', shape: ['XXX', '.X.'] },
  { id: 'T-e', shape: ['.X', 'XX', '.X'] },
  { id: 'T-s', shape: ['.X.', 'XXX'] },
  { id: 'T-w', shape: ['X.', 'XX', 'X.'] },

  { id: 'S-h', shape: ['.XX', 'XX.'] },
  { id: 'S-v', shape: ['X.', 'XX', '.X'] },
  { id: 'Z-h', shape: ['XX.', '.XX'] },
  { id: 'Z-v', shape: ['.X', 'XX', 'X.'] }
])

const PIECE_BY_ID = new Map(PIECES.map(p => [p.id, p]))

export const getPiece = (id: string): Piece => {
  const p = PIECE_BY_ID.get(id)
  if (p === undefined) {
    throw new Error(`unknown piece id '${id}'`)
  }
  return p
}
