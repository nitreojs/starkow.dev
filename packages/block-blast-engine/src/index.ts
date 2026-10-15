export { Board } from './board'
export type { BoardSnapshot } from './board'

export { PieceGenerator } from './generator'
export type { GeneratorState, Tray } from './generator'

export { MODES, ENGINE_MAJOR } from './modes'

export { PIECES, getPiece, defineCatalogue } from './pieces'

export { applyPlacement, BOARD_CLEAR_BONUS, COMBO_MISSES_ALLOWED } from './scoring'
export type { PlacementInput, PlacementResult } from './scoring'

export { poolForScore, SCORE_BRACKETS } from './weights'
export type { WeightedPool } from './weights'

export { validateRun } from './replay'
export type { ValidateInput, ValidateResult, ValidateOk, ValidateError } from './replay'

export { newGame, applyMove, serializeGame, hydrateGame } from './game'
export type { GameState, GameSnapshot, MoveResult } from './game'

export { encodeMoves, decodeMoves } from './moves'

export { analyzeRun } from './analysis'
export type { AnalyzeInput, Mistake } from './analysis'

export { createRng, serializeRng, hydrateRng } from './rng'
export type { Rng, RngState } from './rng'

export { ENGINE_VERSION } from './version'

export type {
  BoardSize,
  Cell,
  ClearResult,
  HoldMove,
  ModeConfig,
  ModeId,
  Move,
  Piece,
  PlaceMove,
  TrayIndex
} from './types'
