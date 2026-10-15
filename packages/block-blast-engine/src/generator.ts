import type { Board } from './board'
import { completedLines, coversCell, fitsAt, placeAndClear, placementFit, type Grid } from './grid'
import { PIECES } from './pieces'
import { createRng, hydrateRng, serializeRng, type Rng, type RngState } from './rng'
import type { Piece } from './types'
import { poolForScore, type WeightedPool } from './weights'

export type GeneratorState = {
  rng: RngState
}

export type Tray = readonly [Piece, Piece, Piece]

const TRAY_ATTEMPTS = 30
const FIT_NOW_ATTEMPTS = 22
const FIT_CANDIDATES = 6
const SLOT_ATTEMPTS = 40
const NEAR_FULL_EMPTY_CELLS = 3
const ASSIST_CHANCE_START = 0.9
const ASSIST_CHANCE_FLOOR = 0.5
const ASSIST_FADE_SCORE = 9000
const GENEROUS_FADE_SCORE = 5000

const PIECES_BY_SIZE = [...PIECES].sort((a, b) => a.cells.length - b.cells.length)
const ORDERS: readonly (readonly [0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2])[] = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]

const filledCount = (grid: Grid): number => {
  let filled = 0
  for (const v of grid.cells) filled += v
  return filled
}

const snugness = (grid: Grid, piece: Piece, r: number, c: number): number => {
  const { size, cells } = grid
  let touching = 0

  for (const [dr, dc] of piece.cells) {
    for (const [nr, nc] of [[r + dr - 1, c + dc], [r + dr + 1, c + dc], [r + dr, c + dc - 1], [r + dr, c + dc + 1]] as const) {
      const offBoard = nr < 0 || nc < 0 || nr >= size || nc >= size
      if (offBoard || cells[nr * size + nc] !== 0 || coversCell(piece, r, c, nr, nc)) touching++
    }
  }

  return touching
}

const pieceFit = (grid: Grid, piece: Piece): number => {
  let best = -Infinity

  for (let r = 0; r + piece.height <= grid.size; r++) {
    for (let c = 0; c + piece.width <= grid.size; c++) {
      if (fitsAt(grid, piece, r, c)) best = Math.max(best, placementFit(grid, piece, r, c))
    }
  }

  return best
}

const greedyPlacement = (grid: Grid, piece: Piece): Grid | null => {
  const filledBefore = filledCount(grid) + piece.cells.length
  let best: Grid | null = null
  let bestScore = -Infinity

  for (let r = 0; r + piece.height <= grid.size; r++) {
    for (let c = 0; c + piece.width <= grid.size; c++) {
      if (!fitsAt(grid, piece, r, c)) continue

      const next = placeAndClear(grid, piece, r, c)
      const score = (filledBefore - filledCount(next)) * 10 + snugness(grid, piece, r, c)

      if (score > bestScore) {
        best = next
        bestScore = score
      }
    }
  }

  return best
}

const greedyPlacesAll = (grid: Grid, tray: Tray): boolean => ORDERS.some((order) => {
  let current: Grid | null = grid

  for (const index of order) {
    current = greedyPlacement(current, tray[index])
    if (current === null) return false
  }

  return true
})

const everyPieceFitsNow = (grid: Grid, tray: Tray): boolean => tray.every((piece) => {
  for (let r = 0; r + piece.height <= grid.size; r++) {
    for (let c = 0; c + piece.width <= grid.size; c++) {
      if (fitsAt(grid, piece, r, c)) return true
    }
  }

  return false
})

const canPlaceAll = (grid: Grid, pieces: readonly Piece[]): boolean => {
  if (pieces.length === 0) return true

  const tried: string[] = []

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]!
    if (tried.includes(piece.id)) continue
    tried.push(piece.id)

    const rest = [...pieces.slice(0, i), ...pieces.slice(i + 1)]

    for (let r = 0; r + piece.height <= grid.size; r++) {
      for (let c = 0; c + piece.width <= grid.size; c++) {
        if (fitsAt(grid, piece, r, c) && canPlaceAll(placeAndClear(grid, piece, r, c), rest)) return true
      }
    }
  }

  return false
}

const hasNearFullLine = (grid: Grid): boolean => {
  const { size, cells } = grid

  for (let i = 0; i < size; i++) {
    let rowEmpty = 0
    let colEmpty = 0
    for (let j = 0; j < size; j++) {
      if (cells[i * size + j] === 0) rowEmpty++
      if (cells[j * size + i] === 0) colEmpty++
    }
    if ((rowEmpty > 0 && rowEmpty <= NEAR_FULL_EMPTY_CELLS) || (colEmpty > 0 && colEmpty <= NEAR_FULL_EMPTY_CELLS)) return true
  }

  return false
}

const clearsALine = (grid: Grid, piece: Piece): boolean => {
  for (let r = 0; r + piece.height <= grid.size; r++) {
    for (let c = 0; c + piece.width <= grid.size; c++) {
      if (fitsAt(grid, piece, r, c) && completedLines(grid, piece, r, c) > 0) return true
    }
  }

  return false
}

const clearingSubPool = (grid: Grid, pool: WeightedPool): WeightedPool => {
  const pieces: Piece[] = []
  const weights: number[] = []

  pool.pieces.forEach((piece, i) => {
    if (clearsALine(grid, piece)) {
      pieces.push(piece)
      weights.push(pool.weights[i]!)
    }
  })

  return { pieces, weights, total: weights.reduce((sum, w) => sum + w, 0) }
}

export class PieceGenerator {
  private rng: Rng

  constructor (seed: number) {
    this.rng = createRng(seed)
  }

  static hydrate (state: GeneratorState): PieceGenerator {
    const gen = new PieceGenerator(0)
    gen.rng = hydrateRng(state.rng)
    return gen
  }

  serialize (): GeneratorState {
    return { rng: serializeRng(this.rng) }
  }

  nextTray (board: Board, score: number): Tray {
    const pool = poolForScore(score)
    const grid: Grid = board.snapshot()
    const clearers = hasNearFullLine(grid) ? clearingSubPool(grid, pool) : null
    const assistChance = Math.max(ASSIST_CHANCE_FLOOR, ASSIST_CHANCE_START - (ASSIST_CHANCE_START - ASSIST_CHANCE_FLOOR) * score / ASSIST_FADE_SCORE)
    const generous = this.rng.next() < 1 - score / GENEROUS_FADE_SCORE
    const fitByPiece = new Map<string, number>()
    let best: Tray | null = null
    let bestFit = -Infinity
    let candidates = 0

    for (let attempt = 0; attempt < TRAY_ATTEMPTS && candidates < FIT_CANDIDATES; attempt++) {
      const tray: [Piece, Piece, Piece] = [this.draw(pool), this.draw(pool), this.draw(pool)]

      if (clearers !== null && clearers.total > 0 && !tray.some(p => clearers.pieces.includes(p)) && this.rng.next() < assistChance) {
        tray[Math.floor(this.rng.next() * 3) as 0 | 1 | 2] = this.draw(clearers)
      }

      const acceptable = attempt >= FIT_NOW_ATTEMPTS
        ? canPlaceAll(grid, tray)
        : everyPieceFitsNow(grid, tray) && (generous ? greedyPlacesAll(grid, tray) : canPlaceAll(grid, tray))

      if (!acceptable) continue

      const fits = tray.map((piece) => {
        let fit = fitByPiece.get(piece.id)
        if (fit === undefined) {
          fit = pieceFit(grid, piece)
          fitByPiece.set(piece.id, fit)
        }
        return fit
      })
      const trayFit = Math.min(...fits) + (fits[0]! + fits[1]! + fits[2]!) / 6

      if (trayFit > bestFit) {
        best = tray
        bestFit = trayFit
      }
      candidates++
    }

    return best ?? this.buildFittingTray(grid, pool)
  }

  private draw (pool: WeightedPool): Piece {
    let r = this.rng.next() * pool.total

    for (let i = 0; i < pool.pieces.length; i++) {
      r -= pool.weights[i]!
      if (r < 0) return pool.pieces[i]!
    }

    return pool.pieces[pool.pieces.length - 1]!
  }

  private buildFittingTray (grid: Grid, pool: WeightedPool): Tray {
    const tray: Piece[] = []

    for (let slot = 0; slot < 3; slot++) {
      let chosen: Piece | null = null

      for (let i = 0; i < SLOT_ATTEMPTS && chosen === null; i++) {
        const candidate = this.draw(pool)
        if (canPlaceAll(grid, [...tray, candidate])) chosen = candidate
      }

      chosen ??= PIECES_BY_SIZE.find(p => canPlaceAll(grid, [...tray, p])) ?? this.draw(pool)
      tray.push(chosen)
    }

    return [tray[0]!, tray[1]!, tray[2]!]
  }
}
