import type { ModeConfig, ModeId } from './types'

export const MODES: Record<ModeId, ModeConfig> = {
  classic: {
    id: 'classic',
    boardSize: 8,
    maxMoves: null,
    generator: 'solvability-aware',
    resumable: true
  },
  'limited-moves': {
    id: 'limited-moves',
    boardSize: 8,
    maxMoves: 50,
    generator: 'seeded-bag',
    resumable: false
  },
  'big-board': {
    id: 'big-board',
    boardSize: 10,
    maxMoves: null,
    generator: 'solvability-aware',
    resumable: true
  }
}

export const ENGINE_MAJOR = 2
