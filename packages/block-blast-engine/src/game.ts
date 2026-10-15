import { Board } from './board'
import { PieceGenerator } from './generator'
import { MODES } from './modes'
import { getPiece } from './pieces'
import type { RngState } from './rng'
import { applyPlacement } from './scoring'
import type { BoardSize, ClearResult, ModeId, Move, Piece } from './types'

export type GameState = {
  readonly mode: ModeId
  readonly board: Board
  readonly tray: readonly (Piece | null)[]
  readonly held: Piece | null
  readonly generator: PieceGenerator
  readonly score: number
  readonly combo: number
  readonly comboMisses: number
  readonly maxCombo: number
  readonly placements: number
  readonly linesCleared: number
  readonly boardClears: number
  readonly over: boolean
}

export type MoveResult = {
  readonly state: GameState
  readonly placedCells: readonly number[]
  readonly clear: ClearResult | null
  readonly pointsGained: number
  readonly boardCleared: boolean
}

export type GameSnapshot = {
  readonly mode: ModeId
  readonly rng: RngState
  readonly boardCells: readonly number[]
  readonly tray: readonly (string | null)[]
  readonly held: string | null
  readonly score: number
  readonly combo: number
  readonly comboMisses: number
  readonly maxCombo: number
  readonly placements: number
  readonly linesCleared: number
  readonly boardClears: number
  readonly over: boolean
}

const isStuck = (mode: ModeId, board: Board, tray: readonly (Piece | null)[], held: Piece | null): boolean =>
  board.isGameOver(MODES[mode].hold ? [...tray, held] : tray)

const refill = (state: GameState, board: Board, tray: readonly (Piece | null)[], score: number): { tray: readonly (Piece | null)[], generator: PieceGenerator } => {
  if (tray.some(p => p !== null)) return { tray, generator: state.generator }

  const generator = PieceGenerator.hydrate(state.generator.serialize())

  return { tray: [...generator.nextTray(board, score)], generator }
}

export const newGame = (mode: ModeId, seed: number): GameState => {
  const board = new Board(MODES[mode].boardSize)
  const generator = new PieceGenerator(seed)

  return {
    mode,
    board,
    tray: [...generator.nextTray(board, 0)],
    held: null,
    generator,
    score: 0,
    combo: 0,
    comboMisses: 0,
    maxCombo: 0,
    placements: 0,
    linesCleared: 0,
    boardClears: 0,
    over: false
  }
}

export const applyMove = (state: GameState, move: Move): MoveResult | null => {
  if (state.over) return null

  const piece = state.tray[move.trayIndex]
  if (piece === null || piece === undefined) return null

  if (move.kind === 'hold') {
    if (!MODES[state.mode].hold) return null

    const swapped = [...state.tray]
    swapped[move.trayIndex] = state.held
    const { tray, generator } = refill(state, state.board, swapped, state.score)

    return {
      state: { ...state, tray, held: piece, generator, over: isStuck(state.mode, state.board, tray, piece) },
      placedCells: [],
      clear: null,
      pointsGained: 0,
      boardCleared: false
    }
  }

  if (!state.board.canPlace(piece, move.r, move.c)) return null

  const board = Board.fromSnapshot(state.board.snapshot())
  board.place(piece, move.r, move.c)
  const placedCells = piece.cells.map(([dr, dc]) => (move.r + dr) * board.size + (move.c + dc))

  const clear = board.clearFullLines()
  const lines = clear.rows.length + clear.cols.length
  const boardCleared = lines > 0 && board.cells.every(v => v === 0)
  const step = applyPlacement({
    cellsPlaced: piece.cells.length,
    linesCleared: lines,
    boardCleared,
    combo: state.combo,
    comboMisses: state.comboMisses
  })
  const score = state.score + step.pointsGained

  const remaining = [...state.tray]
  remaining[move.trayIndex] = null
  const { tray, generator } = refill(state, board, remaining, score)

  const placements = state.placements + 1
  const maxMoves = MODES[state.mode].maxMoves
  const over = (maxMoves !== null && placements >= maxMoves) || isStuck(state.mode, board, tray, state.held)

  return {
    state: {
      ...state,
      board,
      tray,
      generator,
      score,
      combo: step.combo,
      comboMisses: step.comboMisses,
      maxCombo: Math.max(state.maxCombo, step.combo),
      placements,
      linesCleared: state.linesCleared + lines,
      boardClears: state.boardClears + (boardCleared ? 1 : 0),
      over
    },
    placedCells,
    clear: lines > 0 ? clear : null,
    pointsGained: step.pointsGained,
    boardCleared
  }
}

export const serializeGame = (state: GameState): GameSnapshot => ({
  mode: state.mode,
  rng: state.generator.serialize().rng,
  boardCells: Array.from(state.board.cells),
  tray: state.tray.map(p => p?.id ?? null),
  held: state.held?.id ?? null,
  score: state.score,
  combo: state.combo,
  comboMisses: state.comboMisses,
  maxCombo: state.maxCombo,
  placements: state.placements,
  linesCleared: state.linesCleared,
  boardClears: state.boardClears,
  over: state.over
})

export const hydrateGame = (snapshot: GameSnapshot): GameState => {
  const board = Board.fromSnapshot({ size: MODES[snapshot.mode].boardSize as BoardSize, cells: Uint8Array.from(snapshot.boardCells) })

  return {
    mode: snapshot.mode,
    board,
    tray: snapshot.tray.map(id => (id === null ? null : getPiece(id))),
    held: snapshot.held === null ? null : getPiece(snapshot.held),
    generator: PieceGenerator.hydrate({ rng: snapshot.rng }),
    score: snapshot.score,
    combo: snapshot.combo,
    comboMisses: snapshot.comboMisses,
    maxCombo: snapshot.maxCombo,
    placements: snapshot.placements,
    linesCleared: snapshot.linesCleared,
    boardClears: snapshot.boardClears,
    over: snapshot.over
  }
}
