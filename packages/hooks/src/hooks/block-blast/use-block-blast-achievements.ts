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
  { id: 'streak-5',            title: 'on fire',                description: 'reach a 5-clear streak' },
  { id: 'streak-10',           title: 'unstoppable',            description: 'reach a 10-clear streak' },
  { id: 'limited-clear-bar',   title: 'efficient',              description: 'finish a full 50-move limited-moves run with ≥ 1500 points' }
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
