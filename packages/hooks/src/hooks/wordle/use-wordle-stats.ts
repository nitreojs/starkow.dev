import { useCallback, useState } from 'preact/compat'

import type { Lang, Length } from '@starkow.dev/wordle-engine'

import { getStats, setStats } from './persistence'
import { EMPTY_STATS, type StatsRecord } from './types'

const today = (): string => new Date().toISOString().slice(0, 10)

const yesterday = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

export interface UseWordleStats {
  stats: StatsRecord
  recordGame: (won: boolean, attempts: number, isDaily: boolean) => void
  reload: () => void
}

export const useWordleStats = (lang: Lang, length: Length): UseWordleStats => {
  const [stats, setState] = useState<StatsRecord>(() => getStats(lang, length))

  const reload = useCallback(() => {
    setState(getStats(lang, length))
  }, [lang, length])

  const recordGame = useCallback((won: boolean, attempts: number, isDaily: boolean) => {
    const current = getStats(lang, length)
    const next: StatsRecord = {
      ...current,
      played: current.played + 1,
      won: current.won + (won ? 1 : 0),
      distribution: [...current.distribution] as StatsRecord['distribution']
    }

    if (won && attempts >= 1 && attempts <= 6) {
      next.distribution[attempts - 1] = next.distribution[attempts - 1] + 1
    }

    if (isDaily) {
      const t = today()

      if (won) {
        const lastIso = current.lastWonDate
        const continues = lastIso === yesterday(t) || lastIso === t
        next.currentStreak = continues ? current.currentStreak + 1 : 1
        next.bestStreak = Math.max(current.bestStreak, next.currentStreak)
        next.lastWonDate = t
      } else {
        next.currentStreak = 0
      }
    }

    setStats(lang, length, next)
    setState(next)
  }, [lang, length])

  return { stats: stats ?? EMPTY_STATS, recordGame, reload }
}
