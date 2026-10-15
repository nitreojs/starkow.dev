import { FC, useState } from 'preact/compat'
import clsx from 'clsx'

import type { BlockBlastDailyStatus } from '@starkow.dev/hooks'

import { BlockBlastLeaderboard } from '../Leaderboard'

interface BlockBlastDailyBarProps {
  status: BlockBlastDailyStatus
  date: string | null
  ranked: boolean
  onRetry: () => void
}

export const BlockBlastDailyBar: FC<BlockBlastDailyBarProps> = ({ status, date, ranked, onRetry }) => {
  const [showBoard, setShowBoard] = useState<boolean>(false)

  if (status === 'loading' || status === 'idle') {
    return <div class='bb-daily-bar'><span class='text-half-visible'>fetching today's daily…</span></div>
  }

  if (status === 'error') {
    return (
      <div class='bb-daily-bar bb-daily-bar-message'>
        <span>couldn't reach the daily server — are you offline?</span>
        <button class='cool-button' onClick={onRetry}>try again</button>
      </div>
    )
  }

  if (status === 'outdated') {
    return (
      <div class='bb-daily-bar bb-daily-bar-message'>
        <span>blockblast was updated — reload the page to play today's daily.</span>
        <button class='cool-button' onClick={() => window.location.reload()}>reload</button>
      </div>
    )
  }

  return (
    <div class='bb-daily'>
      <div class='bb-daily-bar'>
        <span>daily · <b>{date}</b></span>
        <span class={clsx('bb-daily-badge', ranked && 'bb-daily-badge-ranked')}>
          {ranked ? 'ranked run' : 'practice — you already played today'}
        </span>
        <button class='bb-link-button' aria-expanded={showBoard} onClick={() => setShowBoard(v => !v)}>
          {showBoard ? 'hide leaderboard' : 'leaderboard'}
        </button>
      </div>
      {showBoard && date !== null && <BlockBlastLeaderboard date={date} />}
    </div>
  )
}
