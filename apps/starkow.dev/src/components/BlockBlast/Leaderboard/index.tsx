import { FC, useCallback, useEffect, useState } from 'preact/compat'
import clsx from 'clsx'

import { fetchDailyLeaderboard, type DailyLeaderboard } from '@starkow.dev/hooks'

interface BlockBlastLeaderboardProps {
  date: string
}

const LIMIT = 20

export const BlockBlastLeaderboard: FC<BlockBlastLeaderboardProps> = ({ date }) => {
  const [data, setData] = useState<DailyLeaderboard | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    const res = await fetchDailyLeaderboard(date, LIMIT)
    setData(res)
    setStatus(res === null ? 'error' : 'ready')
  }, [date])

  useEffect(() => { void load() }, [load])

  const you = data?.you ?? null
  const youOutsideTop = you !== null && data !== null && !data.entries.some(e => e.id === you.id)

  return (
    <div class='bb-leaderboard'>
      <div class='bb-leaderboard-head'>
        <span>leaderboard · {date}</span>
        {data !== null && <span class='text-half-visible'>{data.total} {data.total === 1 ? 'player' : 'players'}</span>}
      </div>

      {status === 'loading' && <p class='text-half-visible'>loading…</p>}
      {status === 'error' && (
        <p>
          couldn't load the leaderboard. <button class='bb-link-button' onClick={() => { void load() }}>retry</button>
        </p>
      )}
      {status === 'ready' && data !== null && data.entries.length === 0 && (
        <p class='text-half-visible'>no runs yet — be the first.</p>
      )}

      {status === 'ready' && data !== null && data.entries.length > 0 && (
        <table class='bb-leaderboard-table'>
          <thead>
            <tr class='text-half-visible'>
              <th>#</th>
              <th>name</th>
              <th>score</th>
              <th>combo</th>
              <th>lines</th>
            </tr>
          </thead>
          <tbody>
            {[...data.entries, ...(youOutsideTop ? [you] : [])].map(e => (
              <tr key={e.id} class={clsx(e.id === you?.id && 'bb-leaderboard-you', e.hidden === true && 'bb-leaderboard-hidden', youOutsideTop && e === you && 'bb-leaderboard-gap')}>
                <td>{e.rank}</td>
                <td class='bb-leaderboard-name'>{e.nickname}</td>
                <td>{e.score.toLocaleString('en-US')}</td>
                <td>×{e.maxCombo}</td>
                <td>{e.linesCleared}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
