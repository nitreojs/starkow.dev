import type { BoardSize, Move, TrayIndex } from './types'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const HOLD_BIT = 1 << 11

export const encodeMoves = (moves: readonly Move[], boardSize: BoardSize): string => {
  let out = ''

  for (const move of moves) {
    const value = move.kind === 'hold'
      ? HOLD_BIT | (move.trayIndex << 9)
      : (move.trayIndex << 9) | (move.r * boardSize + move.c)

    out += ALPHABET[value >> 6]! + ALPHABET[value & 63]!
  }

  return out
}

export const decodeMoves = (encoded: string, boardSize: BoardSize): Move[] | null => {
  if (encoded.length % 2 !== 0) return null

  const moves: Move[] = []

  for (let i = 0; i < encoded.length; i += 2) {
    const high = ALPHABET.indexOf(encoded[i]!)
    const low = ALPHABET.indexOf(encoded[i + 1]!)
    if (high < 0 || low < 0) return null

    const value = (high << 6) | low
    const trayIndex = (value >> 9) & 3
    if (trayIndex > 2) return null

    if ((value & HOLD_BIT) !== 0) {
      if ((value & 511) !== 0) return null
      moves.push({ kind: 'hold', trayIndex: trayIndex as TrayIndex })
      continue
    }

    const cell = value & 511
    if (cell >= boardSize * boardSize) return null
    moves.push({ kind: 'place', trayIndex: trayIndex as TrayIndex, r: Math.floor(cell / boardSize), c: cell % boardSize })
  }

  return moves
}
