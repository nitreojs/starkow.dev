import type { ModeConfig, ModeId } from './types'

export const MODES: Record<ModeId, ModeConfig> = {
  classic: {
    id: 'classic',
    boardSize: 8,
    maxMoves: null,
    resumable: true,
    hold: false
  },
  'limited-moves': {
    id: 'limited-moves',
    boardSize: 8,
    maxMoves: 50,
    resumable: false,
    hold: false
  },
  'big-board': {
    id: 'big-board',
    boardSize: 10,
    maxMoves: null,
    resumable: true,
    hold: false
  },
  hold: {
    id: 'hold',
    boardSize: 8,
    maxMoves: null,
    resumable: true,
    hold: true
  },
  daily: {
    id: 'daily',
    boardSize: 8,
    maxMoves: null,
    resumable: true,
    hold: false
  }
}

export const ENGINE_MAJOR = 3
