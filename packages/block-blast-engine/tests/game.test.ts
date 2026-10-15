import { describe, expect, it } from 'vitest'

import { applyMove, hydrateGame, newGame, serializeGame, type GameState } from '../src/game'
import { MODES } from '../src/modes'
import { playFirstFit } from './play'

const withBoard = (state: GameState, filled: (i: number) => boolean, tray: (string | null)[], held: string | null = null): GameState => {
  const snapshot = serializeGame(state)
  const cells = snapshot.boardCells.map((_, i) => (filled(i) ? 1 : 0))
  return hydrateGame({ ...snapshot, boardCells: cells, tray, held })
}

const twoGapsPerLine = (i: number): boolean => {
  const r = Math.floor(i / 8)
  const c = i % 8
  return c !== r && c !== (r + 4) % 8
}

describe('game rules', () => {
  it('parks a piece in an empty hold slot and leaves the tray slot empty', () => {
    const state = newGame('hold', 5)
    const parked = state.tray[1]
    const result = applyMove(state, { kind: 'hold', trayIndex: 1 })!

    expect(result.state.held).toBe(parked)
    expect(result.state.tray[1]).toBeNull()
    expect(result.pointsGained).toBe(0)
  })

  it('swaps the tray piece with the held piece', () => {
    const state = withBoard(newGame('hold', 5), () => false, ['1x1', '2x2', '3x3'], '1x5')
    const result = applyMove(state, { kind: 'hold', trayIndex: 2 })!

    expect(result.state.held?.id).toBe('3x3')
    expect(result.state.tray.map(p => p?.id)).toEqual(['1x1', '2x2', '1x5'])
  })

  it('deals a fresh tray once the last tray piece is placed while a piece stays held', () => {
    let state = withBoard(newGame('hold', 5), () => false, ['1x1', null, null], '3x3')
    state = applyMove(state, { kind: 'place', trayIndex: 0, r: 0, c: 0 })!.state

    expect(state.tray.every(p => p !== null)).toBe(true)
    expect(state.held?.id).toBe('3x3')
  })

  it('a placeable held piece keeps a hold-mode game alive', () => {
    const hold = withBoard(newGame('hold', 5), twoGapsPerLine, ['3x3', null, '1x1'], '1x1')
    const after = applyMove(hold, { kind: 'place', trayIndex: 2, r: 0, c: 0 })!

    expect(after.clear).toBeNull()
    expect(after.state.over).toBe(false)
  })

  it('the same position without hold is game over', () => {
    const classic = withBoard(newGame('classic', 5), twoGapsPerLine, ['3x3', null, '1x1'])
    const after = applyMove(classic, { kind: 'place', trayIndex: 2, r: 0, c: 0 })!

    expect(after.clear).toBeNull()
    expect(after.state.over).toBe(true)
  })

  it('ends a limited-moves game at the move limit', () => {
    const { state } = playFirstFit(9, 'limited-moves', 200)

    expect(state.placements).toBeLessThanOrEqual(MODES['limited-moves'].maxMoves!)
    expect(state.over).toBe(true)
    expect(applyMove(state, { kind: 'place', trayIndex: 0, r: 0, c: 0 })).toBeNull()
  })

  it('rejects placing an empty slot or onto filled cells', () => {
    const state = withBoard(newGame('classic', 5), i => i === 0, ['1x1', null, '1x1'])

    expect(applyMove(state, { kind: 'place', trayIndex: 1, r: 4, c: 4 })).toBeNull()
    expect(applyMove(state, { kind: 'place', trayIndex: 0, r: 0, c: 0 })).toBeNull()
  })

  it('continues identically after serialize → hydrate', () => {
    const { state } = playFirstFit(31, 'classic', 20)
    const resumed = hydrateGame(serializeGame(state))
    const move = { kind: 'place', trayIndex: state.tray.findIndex(p => p !== null) as 0 | 1 | 2, r: 0, c: 0 } as const

    const a = applyMove(state, move)
    const b = applyMove(resumed, move)

    expect(b === null ? null : serializeGame(b.state)).toEqual(a === null ? null : serializeGame(a.state))
  })
})
