import { applyMove, newGame, type GameState } from '../src/game'
import type { ModeId, Move } from '../src/types'

export const playFirstFit = (seed: number, mode: ModeId, maxMoves: number, holdEvery = 0): { moves: Move[], state: GameState } => {
  let state = newGame(mode, seed)
  const moves: Move[] = []

  while (moves.length < maxMoves && !state.over) {
    let next: Move | null = null

    if (holdEvery > 0 && moves.length % holdEvery === holdEvery - 1) {
      const slot = state.tray.findIndex(p => p !== null)
      if (slot >= 0) next = { kind: 'hold', trayIndex: slot as 0 | 1 | 2 }
    }

    if (next === null) {
      search:
      for (const trayIndex of [0, 1, 2] as const) {
        const piece = state.tray[trayIndex]
        if (piece === null || piece === undefined) continue
        for (let r = 0; r + piece.height <= state.board.size; r++) {
          for (let c = 0; c + piece.width <= state.board.size; c++) {
            if (state.board.canPlace(piece, r, c)) {
              next = { kind: 'place', trayIndex, r, c }
              break search
            }
          }
        }
      }
    }

    if (next === null) break
    const result = applyMove(state, next)
    if (result === null) break
    state = result.state
    moves.push(next)
  }

  return { moves, state }
}
