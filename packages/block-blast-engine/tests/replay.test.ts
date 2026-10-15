import { describe, expect, it } from 'vitest'

import { validateRun } from '../src/replay'
import { ENGINE_VERSION } from '../src/version'
import { playFirstFit } from './play'

describe('validateRun', () => {
  it('reproduces the final state of a classic run', () => {
    const { moves, state } = playFirstFit(2024, 'classic', 80)

    expect(validateRun({ seed: 2024, mode: 'classic', engineVersion: ENGINE_VERSION, moves })).toEqual({
      valid: true,
      score: state.score,
      linesCleared: state.linesCleared,
      placements: state.placements,
      maxCombo: state.maxCombo,
      boardClears: state.boardClears,
      over: state.over
    })
  })

  it('reproduces a hold-mode run that parks and swaps pieces', () => {
    const { moves, state } = playFirstFit(77, 'hold', 80, 4)

    expect(moves.some(m => m.kind === 'hold')).toBe(true)
    expect(validateRun({ seed: 77, mode: 'hold', engineVersion: ENGINE_VERSION, moves })).toMatchObject({ valid: true, score: state.score })
  })

  it('rejects a placement on an occupied or off-board cell', () => {
    const { moves } = playFirstFit(2024, 'classic', 5)

    expect(validateRun({ seed: 2024, mode: 'classic', engineVersion: ENGINE_VERSION, moves: [...moves, { kind: 'place', trayIndex: 0, r: -1, c: 0 }] }))
      .toEqual({ valid: false, reason: 'illegal-move' })
  })

  it('rejects hold moves outside hold mode', () => {
    expect(validateRun({ seed: 1, mode: 'classic', engineVersion: ENGINE_VERSION, moves: [{ kind: 'hold', trayIndex: 0 }] }))
      .toEqual({ valid: false, reason: 'illegal-move' })
  })

  it('rejects unsupported engine version', () => {
    expect(validateRun({ seed: 1, mode: 'classic', engineVersion: '99.0.0', moves: [] }))
      .toEqual({ valid: false, reason: 'unsupported-engine' })
  })
})
