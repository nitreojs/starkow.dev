import { useReducer, useCallback } from 'preact/compat'

import {
  Board,
  ENGINE_MAJOR,
  ENGINE_VERSION,
  MODES,
  PieceGenerator,
  applyPlacement,
  getPiece,
  type Move,
  type ModeId,
  type Piece
} from '@starkow.dev/block-blast-engine'

import type { TrayIndex, ResumableSave } from './types'

export type BlockBlastGameState = {
  mode: ModeId
  seed: number
  board: Board
  cellPieceIds: (string | null)[]
  generator: PieceGenerator
  tray: (Piece | null)[]
  score: number
  streak: number
  movesMade: number
  moveHistory: Move[]
  lastCleared: { rows: readonly number[], cols: readonly number[] } | null
  // indices of cells animated as "just placed" — empty on init/hydrate
  lastPlacedCells: readonly number[]
  // dynamic regret signal: placements since the last line clear (resets on clear)
  roundsSinceClear: number
  // count of isolated empty cells (no empty orthogonal neighbour) created in the last 3 placements
  recentHolesCreated: number
  // sliding window of piece ids the engine recently produced — fuels the anti-repeat penalty
  recentPieceIds: readonly string[]
  status: 'playing' | 'game-over'
}

// keep the last 3 trays' worth of pieces in history (9 ids)
const RECENT_PIECES_WINDOW = 9
const trimRecent = (ids: readonly string[]): readonly string[] =>
  ids.length <= RECENT_PIECES_WINDOW ? ids : ids.slice(ids.length - RECENT_PIECES_WINDOW)

type Action =
  | { type: 'init', mode: ModeId, seed: number }
  | { type: 'hydrate', save: ResumableSave }
  | { type: 'place', trayIndex: TrayIndex, r: number, c: number }
  | { type: 'rescue-tray' }
  | { type: 'clear-last-cleared' }
  | { type: 'abandon' }

// counts empty cells in `board` whose orthogonal neighbours are all filled or off-board
const countIsolatedEmpties = (board: Board): number => {
  const size = board.size
  const cells = board.cells
  let isolated = 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r * size + c] !== 0) continue
      let allBlocked = true
      const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue
        if (cells[nr * size + nc] === 0) { allBlocked = false; break }
      }
      if (allBlocked) isolated++
    }
  }
  return isolated
}

const fresh = (mode: ModeId, seed: number): BlockBlastGameState => {
  const cfg = MODES[mode]
  const board = new Board(cfg.boardSize)
  const gen = new PieceGenerator(seed, cfg.generator)
  const tray = [...gen.nextTray(board)]

  return {
    mode,
    seed,
    board,
    cellPieceIds: new Array(cfg.boardSize * cfg.boardSize).fill(null),
    generator: gen,
    tray,
    score: 0,
    streak: 0,
    movesMade: 0,
    moveHistory: [],
    lastCleared: null,
    lastPlacedCells: [],
    roundsSinceClear: 0,
    recentHolesCreated: 0,
    recentPieceIds: tray.map(p => p!.id),
    status: 'playing'
  }
}

const hydrate = (save: ResumableSave): BlockBlastGameState => {
  const cfg = MODES[save.mode]
  const board = new Board(cfg.boardSize)
  for (let i = 0; i < save.boardCells.length; i++) {
    board.cells[i] = save.boardCells[i]!
  }

  const gen = PieceGenerator.hydrate({ rng: save.rngState }, cfg.generator)
  const total = cfg.boardSize * cfg.boardSize
  const restoredIds = save.cellPieceIds !== undefined && save.cellPieceIds.length === total
    ? [...save.cellPieceIds]
    : new Array(total).fill(null)

  return {
    mode: save.mode,
    seed: save.seed,
    board,
    cellPieceIds: restoredIds,
    generator: gen,
    tray: save.tray.map(id => id === null ? null : getPiece(id)),
    score: save.score,
    streak: save.streak,
    movesMade: save.movesMade,
    moveHistory: [...save.moveHistory],
    lastCleared: null,
    lastPlacedCells: [],
    roundsSinceClear: 0,
    recentHolesCreated: 0,
    recentPieceIds: save.tray.filter((id): id is string => id !== null),
    status: 'playing'
  }
}

const reducer = (state: BlockBlastGameState, action: Action): BlockBlastGameState => {
  switch (action.type) {
    case 'init':      return fresh(action.mode, action.seed)
    case 'hydrate':   return hydrate(action.save)
    case 'clear-last-cleared': return { ...state, lastCleared: null }
    case 'abandon':   return { ...state, status: 'game-over' }
    case 'place': {
      if (state.status !== 'playing') return state

      const piece = state.tray[action.trayIndex]
      if (piece === null || piece === undefined) return state
      if (!state.board.canPlace(piece, action.r, action.c)) return state

      const size = state.board.size
      const next = new Board(size)
      next.cells.set(state.board.cells)
      next.place(piece, action.r, action.c)

      const nextCellIds = [...state.cellPieceIds]
      const placedIndices: number[] = []
      for (const [dr, dc] of piece.cells) {
        const idx = (action.r + dr) * size + (action.c + dc)
        nextCellIds[idx] = piece.id
        placedIndices.push(idx)
      }

      const clear = next.clearFullLines()
      const clearedRows = new Set(clear.rows)
      const clearedCols = new Set(clear.cols)
      for (const r of clear.rows) for (let c = 0; c < size; c++) nextCellIds[r * size + c] = null
      for (const c of clear.cols) for (let r = 0; r < size; r++) nextCellIds[r * size + c] = null

      // only animate cells that weren't immediately cleared
      const lastPlaced = placedIndices.filter(idx => {
        const r = Math.floor(idx / size)
        const c = idx % size
        return !clearedRows.has(r) && !clearedCols.has(c)
      })

      const step = applyPlacement({
        cellsPlaced: piece.cells.length,
        linesCleared: clear.rows.length + clear.cols.length,
        cellsCleared: clear.cellsCleared,
        prevStreak: state.streak
      })

      const linesCleared = clear.rows.length + clear.cols.length
      const prevIsolated = countIsolatedEmpties(state.board)
      const nextIsolated = countIsolatedEmpties(next)
      const newHoles = Math.max(0, nextIsolated - prevIsolated)
      // exponential decay: keeps the holes from a few moves back, fades older ones
      const recentHolesCreated = Math.round(state.recentHolesCreated * 0.5) + newHoles
      const roundsSinceClear = linesCleared > 0 ? 0 : state.roundsSinceClear + 1
      const boardJustCleared = next.cells.every(v => v === 0)

      const nextTray = [...state.tray]
      nextTray[action.trayIndex] = null
      const allConsumed = nextTray.every(p => p === null)

      let genAfter = state.generator
      let finalTray = nextTray
      let nextRecentPieceIds = state.recentPieceIds
      if (allConsumed) {
        const state1 = state.generator.serialize()
        genAfter = PieceGenerator.hydrate(state1, MODES[state.mode].generator)
        finalTray = [...genAfter.nextTray(next, {
          streak: step.newStreak,
          roundsSinceClear,
          recentHolesCreated,
          boardJustCleared,
          recentPieceIds: state.recentPieceIds
        })]
        nextRecentPieceIds = trimRecent([...state.recentPieceIds, ...finalTray.map(p => p!.id)])
      }

      const movesMade = state.movesMade + 1
      const moveLimit = MODES[state.mode].maxMoves

      let status: BlockBlastGameState['status'] = 'playing'
      if (moveLimit !== null && movesMade >= moveLimit) status = 'game-over'
      else if (next.isGameOver(finalTray)) status = 'game-over'

      return {
        ...state,
        board: next,
        cellPieceIds: nextCellIds,
        tray: finalTray,
        generator: genAfter,
        score: state.score + step.pointsGained,
        streak: step.newStreak,
        movesMade,
        moveHistory: [...state.moveHistory, { trayIndex: action.trayIndex, r: action.r, c: action.c }],
        lastCleared: (clear.rows.length > 0 || clear.cols.length > 0) ? { rows: clear.rows, cols: clear.cols } : null,
        roundsSinceClear,
        recentHolesCreated,
        recentPieceIds: nextRecentPieceIds,
        lastPlacedCells: lastPlaced,
        status
      }
    }
    case 'rescue-tray': {
      if (state.status !== 'playing') return state
      const cfg = MODES[state.mode]
      if (cfg.generator !== 'solvability-aware') return state

      const rescued = state.generator.rescueUnplaced(state.board, state.tray, {
        streak: state.streak,
        roundsSinceClear: state.roundsSinceClear,
        recentHolesCreated: state.recentHolesCreated,
        recentPieceIds: state.recentPieceIds
      })
      const newlyAdded: string[] = []
      let changed = false
      for (let i = 0; i < state.tray.length; i++) {
        if (state.tray[i] !== rescued[i]) {
          changed = true
          const r = rescued[i]
          if (r !== null && r !== undefined) newlyAdded.push(r.id)
        }
      }
      if (!changed) return state
      return {
        ...state,
        tray: [...rescued],
        recentPieceIds: trimRecent([...state.recentPieceIds, ...newlyAdded])
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
    dispatch({ type: 'place', trayIndex, r, c })
  }, [])

  const reset = useCallback((mode: ModeId, seed: number) => {
    dispatch({ type: 'init', mode, seed })
  }, [])

  const hydrateFrom = useCallback((save: ResumableSave) => {
    dispatch({ type: 'hydrate', save })
  }, [])

  const clearLastCleared = useCallback(() => {
    dispatch({ type: 'clear-last-cleared' })
  }, [])

  const rescueTray = useCallback(() => {
    dispatch({ type: 'rescue-tray' })
  }, [])

  return { state, place, reset, hydrateFrom, clearLastCleared, rescueTray, engineVersion: ENGINE_VERSION, engineMajor: ENGINE_MAJOR }
}

export const serializeBlockBlastGame = (state: BlockBlastGameState): ResumableSave => {
  const genState = state.generator.serialize()
  return {
    mode: state.mode,
    seed: state.seed,
    rngState: genState.rng,
    boardCells: Array.from(state.board.cells),
    boardSize: state.board.size,
    cellPieceIds: [...state.cellPieceIds],
    tray: state.tray.map(p => p === null ? null : p.id),
    score: state.score,
    streak: state.streak,
    movesMade: state.movesMade,
    moveHistory: [...state.moveHistory],
    engineVersion: ENGINE_VERSION
  }
}
