import { applyMove, newGame } from './game'
import { MODES } from './modes'
import type { ModeId, Move } from './types'
import { ENGINE_VERSION } from './version'

export type ValidateInput = {
  seed: number
  mode: ModeId
  engineVersion: string
  moves: readonly Move[]
}

export type ValidateOk = {
  valid: true
  score: number
  linesCleared: number
  placements: number
  maxCombo: number
  boardClears: number
  over: boolean
}

export type ValidateError = {
  valid: false
  reason:
    | 'illegal-move'
    | 'unsupported-engine'
    | 'unknown-mode'
}

export type ValidateResult = ValidateOk | ValidateError

const SUPPORTED_VERSIONS: readonly string[] = [ENGINE_VERSION]

export const validateRun = (input: ValidateInput): ValidateResult => {
  if (!SUPPORTED_VERSIONS.includes(input.engineVersion)) {
    return { valid: false, reason: 'unsupported-engine' }
  }

  if (MODES[input.mode] === undefined) {
    return { valid: false, reason: 'unknown-mode' }
  }

  let state = newGame(input.mode, input.seed)

  for (const move of input.moves) {
    const result = applyMove(state, move)
    if (result === null) return { valid: false, reason: 'illegal-move' }
    state = result.state
  }

  return {
    valid: true,
    score: state.score,
    linesCleared: state.linesCleared,
    placements: state.placements,
    maxCombo: state.maxCombo,
    boardClears: state.boardClears,
    over: state.over
  }
}
