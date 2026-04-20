import { FC } from 'preact/compat'

import type { StatsRecord } from '@starkow.dev/hooks'

interface Props {
  stats: StatsRecord
  highlightRow?: number | null
  onClose: () => void
}

export const StatsModal: FC<Props> = ({ stats, highlightRow = null, onClose }) => {
  const max = Math.max(1, ...stats.distribution)

  return (
    <div class='wdl-modal-backdrop' onClick={onClose}>
      <div class='wdl-modal' onClick={e => e.stopPropagation()}>
        <h2>stats</h2>
        <div class='wdl-stats-row'>
          <span><b>{stats.played}</b><br /><span class='text-small text-half-visible'>played</span></span>
          <span><b>{stats.played === 0 ? 0 : Math.round((stats.won / stats.played) * 100)}%</b><br /><span class='text-small text-half-visible'>win rate</span></span>
          <span><b>{stats.currentStreak}</b><br /><span class='text-small text-half-visible'>streak</span></span>
          <span><b>{stats.bestStreak}</b><br /><span class='text-small text-half-visible'>best</span></span>
        </div>
        <div class='wdl-stats-dist'>
          {stats.distribution.map((n, i) => (
            <div key={i} class={`wdl-stats-bar${highlightRow === i + 1 ? ' active' : ''}`}>
              <span class='wdl-stats-bar-label'>{i + 1}</span>
              <div class='wdl-stats-bar-track'>
                <div class='wdl-stats-bar-fill' style={{ width: `${(n / max) * 100}%` }} />
              </div>
              <span class='wdl-stats-bar-count'>{n}</span>
            </div>
          ))}
        </div>
        <button class='cool-button' onClick={onClose}>close</button>
      </div>
    </div>
  )
}
