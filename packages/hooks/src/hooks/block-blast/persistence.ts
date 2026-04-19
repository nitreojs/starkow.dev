import { ENGINE_VERSION, type ModeId } from '@starkow.dev/block-blast-engine'

import type { AchievementId, ResumableSave } from './types'

const K = {
  haptics: 'block-blast:haptics',
  achievements: 'block-blast:achievements',
  save: (mode: 'classic' | 'big-board') => `block-blast:save:${mode}`
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

export const getSave = (mode: 'classic' | 'big-board'): ResumableSave | null => {
  const raw = readJson<ResumableSave | null>(K.save(mode), null)
  if (raw === null) return null
  if (raw.engineVersion !== ENGINE_VERSION) {
    remove(K.save(mode))
    return null
  }
  return raw
}

export const writeSave = (mode: 'classic' | 'big-board', save: ResumableSave): void => {
  writeJson(K.save(mode), save)
}

export const clearSave = (mode: 'classic' | 'big-board'): void => {
  remove(K.save(mode))
}

export const canResumeMode = (mode: ModeId): mode is 'classic' | 'big-board' =>
  mode === 'classic' || mode === 'big-board'
