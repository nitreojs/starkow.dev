import type { Lang, Length, Mode } from '@starkow.dev/wordle-engine'

import type { GameView, GuessRejection, GuessResponse } from './types'

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? ''
  : 'https://starkow.dev'

const getFingerprintHeader = (): Record<string, string> => {
  try {
    const fp = localStorage.getItem('starkow:fp')
    return fp !== null ? { 'x-fingerprint': fp } : {}
  } catch { return {} }
}

export const createGame = async (mode: Mode, lang: Lang, length: Length): Promise<GameView> => {
  const res = await fetch(`${API_BASE}/api/wordle/games`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...getFingerprintHeader() },
    body: JSON.stringify({ mode, lang, length })
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

export const submitGuess = async (gameId: string, word: string): Promise<GuessResponse | GuessRejection> => {
  const res = await fetch(`${API_BASE}/api/wordle/games/${encodeURIComponent(gameId)}/guess`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...getFingerprintHeader() },
    body: JSON.stringify({ word })
  })

  if (!res.ok) throw new Error(`submit-guess ${res.status}`)

  return res.json() as Promise<GuessResponse | GuessRejection>
}
