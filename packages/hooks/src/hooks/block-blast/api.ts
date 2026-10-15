import { API_BASE, getFingerprintHeader } from '../api'

import type { DailyLeaderboard, DailyStart, DailySubmitResult } from './types'

const DAILY_URL = `${API_BASE}/api/blockblast/daily`

export const startDaily = async (): Promise<DailyStart | null> => {
  try {
    const res = await fetch(`${DAILY_URL}/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getFingerprintHeader() },
      body: '{}'
    })

    if (!res.ok) return null

    return await (res.json() as Promise<DailyStart>)
  } catch { return null }
}

export const fetchDailyLeaderboard = async (date: string, limit: number): Promise<DailyLeaderboard | null> => {
  try {
    const query = new URLSearchParams({ date, limit: String(limit) })
    const res = await fetch(`${DAILY_URL}/leaderboard?${query.toString()}`, {
      headers: { ...getFingerprintHeader() }
    })

    if (!res.ok) return null

    return await (res.json() as Promise<DailyLeaderboard>)
  } catch { return null }
}

export const submitDaily = async (attemptId: string, nickname: string, moves: string): Promise<DailySubmitResult> => {
  try {
    const res = await fetch(`${DAILY_URL}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getFingerprintHeader() },
      body: JSON.stringify({ attemptId, nickname, moves })
    })

    if (res.status === 404) return { ok: false, error: 'not-found' }
    if (res.status === 409) return { ok: false, error: 'already-submitted' }
    if (!res.ok && res.status !== 400) return { ok: false, error: 'unavailable' }

    return await (res.json() as Promise<DailySubmitResult>)
  } catch { return { ok: false, error: 'unavailable' } }
}
