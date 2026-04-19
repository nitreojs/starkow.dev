export { Board } from './board'
export type { BoardSnapshot } from './board'

export { PieceGenerator } from './generator'
export type { GeneratorState, GenerationContext } from './generator'

export { MODES, ENGINE_MAJOR } from './modes'

export { PIECES, getPiece, defineCatalogue } from './pieces'

export { applyPlacement } from './scoring'
export type { PlacementInput, PlacementResult } from './scoring'

export { validateRun } from './replay'
export type { ValidateInput, ValidateResult, ValidateOk, ValidateError } from './replay'

export { createRng, serializeRng, hydrateRng } from './rng'
export type { Rng, RngState } from './rng'

export { ENGINE_VERSION } from './version'

export type {
  BoardSize,
  Cell,
  ClearResult,
  GeneratorStrategy,
  ModeConfig,
  ModeId,
  Move,
  Piece
} from './types'
