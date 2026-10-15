import { useReducer, useCallback } from 'preact/compat'

import {
  ENGINE_VERSION,
  MODES,
  applyMove,
  hydrateGame,
  newGame,
  serializeGame,
  type GameState,
  type Move,
  type ModeId
} from '@starkow.dev/block-blast-engine'

import type { TrayIndex, ResumableSave } from './types'

export type ScoreEvent = {
  readonly points: number
  readonly lines: number
  readonly combo: number
  readonly boardCleared: boolean
}

export type BlockBlastGameState = {
  seed: number
  game: GameState
  cellPieceIds: (string | null)[]
  moveHistory: Move[]
  lastCleared: { rows: readonly number[], cols: readonly number[] } | null
  lastScoreEvent: ScoreEvent | null
  lastPlacedCells: readonly number[]
}

type Action =
  | { type: 'init', mode: ModeId, seed: number }
  | { type: 'hydrate', save: ResumableSave }
  | { type: 'move', move: Move }

const UI_IDLE = { lastCleared: null, lastScoreEvent: null, lastPlacedCells: [] } as const

const fresh = (mode: ModeId, seed: number): BlockBlastGameState => {
  const size = MODES[mode].boardSize

  return {
    seed,
    game: newGame(mode, seed),
    cellPieceIds: new Array(size * size).fill(null),
    moveHistory: [],
    ...UI_IDLE
  }
}

const hydrate = (save: ResumableSave): BlockBlastGameState => {
  const game = hydrateGame(save.snapshot)
  const total = game.board.size * game.board.size

  return {
    seed: save.seed,
    game,
    cellPieceIds: save.cellPieceIds.length === total ? [...save.cellPieceIds] : new Array(total).fill(null),
    moveHistory: [...save.moveHistory],
    ...UI_IDLE
  }
}

const reducer = (state: BlockBlastGameState, action: Action): BlockBlastGameState => {
  switch (action.type) {
    case 'init': return fresh(action.mode, action.seed)
    case 'hydrate': return hydrate(action.save)
    case 'move': {
      const result = applyMove(state.game, action.move)
      if (result === null) return state

      const moveHistory = [...state.moveHistory, action.move]
      if (action.move.kind === 'hold') return { ...state, game: result.state, moveHistory, ...UI_IDLE }

      const pieceId = state.game.tray[action.move.trayIndex]!.id
      const size = state.game.board.size
      const rows = result.clear?.rows ?? []
      const cols = result.clear?.cols ?? []
      const cleared = new Set<number>()
      for (const r of rows) for (let c = 0; c < size; c++) cleared.add(r * size + c)
      for (const c of cols) for (let r = 0; r < size; r++) cleared.add(r * size + c)

      const cellPieceIds = [...state.cellPieceIds]
      for (const idx of result.placedCells) cellPieceIds[idx] = pieceId
      for (const idx of cleared) cellPieceIds[idx] = null

      return {
        seed: state.seed,
        game: result.state,
        cellPieceIds,
        moveHistory,
        lastCleared: result.clear,
        lastScoreEvent: result.clear !== null
          ? { points: result.pointsGained, lines: rows.length + cols.length, combo: result.state.combo, boardCleared: result.boardCleared }
          : null,
        lastPlacedCells: result.placedCells.filter(idx => !cleared.has(idx))
      }
    }
  }
}

export const useBlockBlastGame = (initial: { mode: ModeId, seed: number } | { save: ResumableSave }) => {
  const [state, dispatch] = useReducer(
    reducer,
    initial,
    (arg) => ('save' in arg) ? hydrate(arg.save) : fresh(arg.mode, arg.seed)
  )

  const place = useCallback((trayIndex: TrayIndex, r: number, c: number) => {
    dispatch({ type: 'move', move: { kind: 'place', trayIndex, r, c } })
  }, [])

  const hold = useCallback((trayIndex: TrayIndex) => {
    dispatch({ type: 'move', move: { kind: 'hold', trayIndex } })
  }, [])

  const reset = useCallback((mode: ModeId, seed: number) => {
    dispatch({ type: 'init', mode, seed })
  }, [])

  const hydrateFrom = useCallback((save: ResumableSave) => {
    dispatch({ type: 'hydrate', save })
  }, [])

  return { state, place, hold, reset, hydrateFrom }
}

export const serializeBlockBlastGame = (state: BlockBlastGameState, date: string | null): ResumableSave => ({
  engineVersion: ENGINE_VERSION,
  seed: state.seed,
  date,
  snapshot: serializeGame(state.game),
  cellPieceIds: [...state.cellPieceIds],
  moveHistory: [...state.moveHistory]
})
