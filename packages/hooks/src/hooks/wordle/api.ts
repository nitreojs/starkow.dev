import type { GameStatus, Lang, Length, Mode } from '@starkow.dev/wordle-engine'

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

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? ''
  : 'https://starkow.dev'

const FP_KEY = 'starkow:fp'

const generateFingerprint = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

const ensureFingerprint = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    const existing = localStorage.getItem(FP_KEY)
    if (existing !== null && existing !== '') return existing

    const fresh = generateFingerprint()

    try { localStorage.setItem(FP_KEY, fresh) } catch { /* storage disabled — still send header for this request */ }

    return fresh
  } catch { return null }
}

const getFingerprintHeader = (): Record<string, string> => {
  const fp = ensureFingerprint()
  return fp !== null ? { 'x-fingerprint': fp } : {}
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
