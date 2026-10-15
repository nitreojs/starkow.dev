import type { GameStatus, Lang, Length, Mode } from '@starkow.dev/wordle-engine'

import { API_BASE, getFingerprintHeader } from '../api'

import type { GameView, GuessRejection, GuessResponse } from './types'

export interface DailyPlayedEntry {
  index: number
  date: string
  lang: Lang
  length: Length
  status: GameStatus
}

export interface DailyStatus {
  epoch: string
  latestIndex: number
  played: DailyPlayedEntry[]
}

export interface CreateGameOptions {
  dailyIndex?: number
  replay?: boolean
}

export const createGame = async (
  mode: Mode,
  lang: Lang,
  length: Length,
  options: CreateGameOptions = {}
): Promise<GameView> => {
  const body: Record<string, unknown> = { mode, lang, length }

  if (options.dailyIndex !== undefined) body.dailyIndex = options.dailyIndex
  if (options.replay === true) body.replay = true

  const res = await fetch(`${API_BASE}/api/wordle/games`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...getFingerprintHeader() },
    body: JSON.stringify(body)
  })

  if (!res.ok) throw new Error(`create-game ${res.status}`)

  return res.json() as Promise<GameView>
}

export const fetchGame = async (gameId: string): Promise<GameView | null> => {
  const res = await fetch(`${API_BASE}/api/wordle/games/${encodeURIComponent(gameId)}`, {
    headers: { ...getFingerprintHeader() }
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`fetch-game ${res.status}`)

  return res.json() as Promise<GameView>
}

export const fetchDailyStatus = async (): Promise<DailyStatus | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/wordle/daily-status`, {
      headers: { ...getFingerprintHeader() }
    })

    if (!res.ok) return null

    return await (res.json() as Promise<DailyStatus>)
  } catch {
    return null
  }
}

export const submitGuess = async (gameId: string, word: string): Promise<GuessResponse | GuessRejection> => {
  const res = await fetch(`${API_BASE}/api/wordle/games/${encodeURIComponent(gameId)}/guess`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...getFingerprintHeader() },
    body: JSON.stringify({ word })
  })

  if (!res.ok) throw new Error(`submit-guess ${res.status}`)

  return res.json() as Promise<GuessResponse | GuessRejection>
}
