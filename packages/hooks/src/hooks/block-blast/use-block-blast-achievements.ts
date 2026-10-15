import { useCallback, useState } from 'preact/compat'

import { getAchievements, unlockAchievement } from './persistence'
import type { AchievementDef, AchievementId } from './types'

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'first-placement',     title: 'first placement',        description: 'place your first piece' },
  { id: 'first-line-clear',    title: 'first clear',            description: 'clear a line' },
  { id: 'double-line-clear',   title: 'two birds one stone',    description: 'clear two lines in one placement' },
  { id: 'triple-line-clear',   title: 'fireworks',              description: 'clear three or more lines in one placement' },
  { id: 'place-3x3',           title: 'the big one',            description: 'place a 3×3 piece' },
  { id: 'reach-1k',            title: '1,000 points',           description: 'reach 1,000 points in a single run' },
  { id: 'reach-5k',            title: '5,000 points',           description: 'reach 5,000 points in a single run' },
  { id: 'reach-10k',           title: '10,000 points',          description: 'reach 10,000 points in a single run' },
  { id: 'survive-100',         title: 'centenarian',            description: 'survive 100 placements' },
  { id: 'survive-200',         title: 'marathon',               description: 'survive 200 placements' },
  { id: 'streak-5',            title: 'on fire',                description: 'reach a ×10 combo' },
  { id: 'streak-10',           title: 'unstoppable',            description: 'reach a ×20 combo' },
  { id: 'limited-clear-bar',   title: 'efficient',              description: 'finish a full 50-move limited-moves run with ≥ 1500 points' },
  { id: 'daily-first',         title: 'daily driver',           description: 'submit a daily challenge run' },
  { id: 'daily-streak-3',      title: 'habit forming',          description: 'submit dailies three UTC days in a row' },
  { id: 'daily-streak-7',      title: 'creature of habit',      description: 'submit dailies seven UTC days in a row' },
  { id: 'daily-top-10',        title: 'podium-ish',             description: 'rank in the daily top 10 at submission' },
  { id: 'board-clear',         title: 'clean slate',            description: 'clear the whole board' },
  { id: 'board-clear-3',       title: 'spring cleaning',        description: 'clear the whole board three times in one run' },
  { id: 'quad-clear',          title: 'quad damage',            description: 'clear four or more lines with one piece' },
  { id: 'combo-30',            title: 'combo wombo',            description: 'reach a ×30 combo' },
  { id: 'hold-5k',             title: 'hold my score',          description: 'reach 5,000 points in hold mode' },
  { id: 'clean-run',           title: 'no notes',               description: 'finish a 100+ placement run with no reviewable mistakes' },
  { id: 'terminal',            title: 'curl up',                description: 'play blockblast from a terminal' }
]

export const useBlockBlastAchievements = () => {
  const [unlocks, setUnlocks] = useState<Record<AchievementId, number>>(getAchievements)

  const tryUnlock = useCallback((id: AchievementId): AchievementDef | null => {
    if (unlocks[id] !== undefined) return null
    const didUnlock = unlockAchievement(id)
    if (!didUnlock) return null
    setUnlocks(prev => ({ ...prev, [id]: Date.now() }))
    return ACHIEVEMENTS.find(a => a.id === id) ?? null
  }, [unlocks])

  return { unlocks, tryUnlock }
}
