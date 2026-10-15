import { ENGINE_VERSION, type ModeId } from '@starkow.dev/block-blast-engine'

import type { AchievementId, ResumableSave } from './types'

const DAY_MS = 86_400_000

const K = {
  haptics: 'block-blast:haptics',
  achievements: 'block-blast:achievements',
  nickname: 'block-blast:nickname',
  dailySubmissions: 'block-blast:daily-submissions',
  save: (mode: ModeId) => `block-blast:save:${mode}`
} as const

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch { return fallback }
}

const writeJson = (key: string, value: unknown): void => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

const remove = (key: string): void => {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

const shiftUtcDate = (date: string, days: number): string =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)

export const todayUtc = (): string => new Date().toISOString().slice(0, 10)

export const getHaptics = (): boolean => readJson<boolean>(K.haptics, true)
export const setHaptics = (v: boolean): void => writeJson(K.haptics, v)

export const getAchievements = (): Record<AchievementId, number> =>
  readJson<Record<AchievementId, number>>(K.achievements, {} as Record<AchievementId, number>)

export const unlockAchievement = (id: AchievementId): boolean => {
  const current = getAchievements()
  if (current[id] !== undefined) return false
  current[id] = Date.now()
  writeJson(K.achievements, current)
  return true
}

export const getSave = (mode: ModeId): ResumableSave | null => {
  const raw = readJson<Partial<ResumableSave> | null>(K.save(mode), null)
  if (raw === null) return null

  const readable = raw.engineVersion === ENGINE_VERSION
    && raw.snapshot?.mode === mode
    && Array.isArray(raw.snapshot.boardCells)
    && Array.isArray(raw.cellPieceIds)
    && Array.isArray(raw.moveHistory)
    && raw.moveHistory.every(move => typeof move?.kind === 'string')
    && (mode !== 'daily' || raw.date === todayUtc())

  if (!readable) {
    remove(K.save(mode))
    return null
  }
  return raw as ResumableSave
}

export const writeSave = (mode: ModeId, save: ResumableSave): void => {
  writeJson(K.save(mode), save)
}

export const clearSave = (mode: ModeId): void => {
  remove(K.save(mode))
}

export const getNickname = (): string => readJson<string>(K.nickname, '')
export const setNickname = (v: string): void => writeJson(K.nickname, v)

export const recordDailySubmission = (date: string): number => {
  const dates = new Set(readJson<string[]>(K.dailySubmissions, []))
  dates.add(date)
  writeJson(K.dailySubmissions, [...dates])

  let streak = 0
  while (dates.has(shiftUtcDate(date, -streak))) streak++
  return streak
}
