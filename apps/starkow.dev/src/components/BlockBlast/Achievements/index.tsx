import { FC, memo } from 'preact/compat'

import { ACHIEVEMENTS, type AchievementId } from '@starkow.dev/hooks'

interface BlockBlastAchievementsProps {
  unlocks: Record<AchievementId, number>
  haptics: boolean
  onToggleHaptics: () => void
}

export const BlockBlastAchievements: FC<BlockBlastAchievementsProps> = memo(({ unlocks, haptics, onToggleHaptics }) => {
  const unlockedCount = Object.keys(unlocks).length
  const total = ACHIEVEMENTS.length

  return (
    <div class='bb-achievements'>
      <details class='bb-achievements-details'>
        <summary>achievements — {unlockedCount}/{total}</summary>
        <ul class='bb-achievements-list'>
          {ACHIEVEMENTS.map(a => {
            const locked = unlocks[a.id] === undefined
            return (
              <li key={a.id} class={locked ? 'bb-ach locked' : 'bb-ach unlocked'}>
                <b>{a.title}</b>
                <span class='text-half-visible'> — {a.description}</span>
              </li>
            )
          })}
        </ul>
      </details>
      <div class='bb-settings'>
        <label>
          <input type='checkbox' checked={haptics} onChange={onToggleHaptics} />
          <span> haptics (vibration on clear)</span>
        </label>
      </div>
    </div>
  )
})
