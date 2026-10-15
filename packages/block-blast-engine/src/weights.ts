import { getPiece } from './pieces'
import type { Piece } from './types'

export type WeightedPool = {
  readonly pieces: readonly Piece[]
  readonly weights: readonly number[]
  readonly total: number
}

export const SCORE_BRACKETS: readonly number[] = [0, 300, 500, 700, 1000, 1400, 1800, 2200, 2500, 3000, 3800, 4500, 5200, 6000, 6800, 7600, 8400]

// block blast 10.8.4 RatioConfig defaults; S/Z rebalanced across mirror images
const WEIGHTS_BY_PIECE: Readonly<Record<string, readonly number[]>> = {
  '1x1': [30, 15, 16, 16, 22, 16, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  '2x1': [10, 20, 10, 6, 12, 15, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
  '1x2': [0, 10, 10, 12, 12, 15, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17],
  '3x1': [0, 0, 12, 18, 20, 11, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
  '1x3': [23, 16, 12, 12, 12, 12, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  'L-small-ne': [23, 20, 14, 10, 18, 20, 17, 17, 17, 17, 15, 15, 15, 15, 15, 15, 15],
  '4x1': [23, 16, 24, 12, 15, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
  'J-big-se': [18, 16, 16, 8, 20, 11, 11, 11, 5, 5, 5, 5, 4, 4, 4, 4, 4],
  '2x2': [25, 18, 10, 12, 15, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17],
  'T-s': [9, 20, 20, 12, 20, 16, 20, 20, 20, 10, 10, 10, 10, 10, 9, 9, 6],
  '1x5': [30, 20, 18, 12, 14, 9, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24],
  'corner5-tr': [35, 15, 12, 14, 18, 25, 11, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4],
  '3x3': [26, 20, 16, 16, 12, 15, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  'S-h': [0, 0, 1, 8, 6, 5, 5.5, 5.5, 5.5, 5.5, 5.5, 10, 8, 8, 8, 8, 8],
  'L-small-nw': [0, 0, 0, 0, 20, 11, 24, 24, 24, 24, 15, 15, 15, 15, 15, 15, 15],
  'S-v': [0, 0, 0, 0, 4.5, 9, 7, 7, 7, 7, 7, 5, 8, 8, 8, 8, 8],
  '1x4': [0, 0, 0, 0, 0, 15, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
  'Z-h': [0, 0, 1, 8, 6, 5, 5.5, 5.5, 5.5, 5.5, 5.5, 10, 8, 8, 8, 8, 8],
  'Z-v': [0, 0, 0, 0, 4.5, 9, 7, 7, 7, 7, 7, 5, 8, 8, 8, 8, 8],
  'T-w': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 6],
  'corner5-tl': [0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 5, 5, 4, 4, 4, 4],
  '5x1': [0, 0, 0, 0, 0, 0, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17],
  'corner5-bl': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 4, 4, 4, 4],
  'corner5-br': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4],
  'T-e': [0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 14, 14, 14, 14, 9, 9, 6],
  'T-n': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
  'L-small-se': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 15, 15, 15, 15, 15, 15],
  'L-small-sw': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 15, 15, 15, 15, 15, 15],
  'L-big-sw': [0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 4, 4, 4, 4, 4],
  'J-big-nw': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4],
  'L-big-ne': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4]
}

const POOLS: readonly WeightedPool[] = SCORE_BRACKETS.map((_, bracket) => {
  const pieces: Piece[] = []
  const weights: number[] = []

  for (const [id, column] of Object.entries(WEIGHTS_BY_PIECE)) {
    const weight = column[bracket]!
    if (weight > 0) {
      pieces.push(getPiece(id))
      weights.push(weight)
    }
  }

  return { pieces, weights, total: weights.reduce((sum, w) => sum + w, 0) }
})

export const poolForScore = (score: number): WeightedPool => {
  let bracket = 0

  while (bracket + 1 < SCORE_BRACKETS.length && score >= SCORE_BRACKETS[bracket + 1]!) {
    bracket++
  }

  return POOLS[bracket]!
}
