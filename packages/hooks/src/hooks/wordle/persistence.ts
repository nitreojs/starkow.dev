import type { Lang, Length, Mode } from '@starkow.dev/wordle-engine'

import { EMPTY_STATS, type StatsRecord } from './types'

const K = {
  stats: (lang: Lang, len: Length) => `wordle:stats:${lang}:${len}`,
  lastConfig: 'wordle:last-config',
  infiniteGameId: 'wordle:infinite-gameId'
} as const

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch { return fallback }
}

const write = (key: string, value: unknown): void => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

const remove = (key: string): void => {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

export const getStats = (lang: Lang, len: Length): StatsRecord =>
  read<StatsRecord>(K.stats(lang, len), EMPTY_STATS)

export const setStats = (lang: Lang, len: Length, stats: StatsRecord): void =>
  write(K.stats(lang, len), stats)

export interface LastConfig { mode: Mode, lang: Lang, length: Length }

export const getLastConfig = (): LastConfig | null =>
  read<LastConfig | null>(K.lastConfig, null)

export const setLastConfig = (c: LastConfig): void => write(K.lastConfig, c)

export const getInfiniteGameId = (): string | null =>
  read<string | null>(K.infiniteGameId, null)

export const setInfiniteGameId = (id: string | null): void => {
  if (id === null) remove(K.infiniteGameId)
  else write(K.infiniteGameId, id)
}
