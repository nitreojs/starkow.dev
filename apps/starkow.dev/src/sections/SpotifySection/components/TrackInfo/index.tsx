import { FC } from 'preact/compat'

import * as Icons from '@starkow.dev/icons'

import './style.css'

import type { TrackData } from '../../types'

interface TrackInfoProps {
  data: TrackData
  progress: number
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)

  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const TrackInfo: FC<TrackInfoProps> = ({ data, progress }) => {
  return (
    <div class='track-info'>
      <div class='track-data-container'>
        <div class='track-text-info'>
          <p class='track-name'>
            <b>{data.name}</b>
          </p>
          <p class='track-artists'>
            <span class='text-half-visible'>by</span> {data.artists.join(', ')}
          </p>
        </div>
        <div class='track-button'>
          <Icons.IconSpotify />
        </div>
      </div>

      <div class='track-timer'>
        <div class='track-time'>
          <div class='track-time-elapsed'>
            {formatTime(progress * 1000)}
          </div>
          {
            !data.playing ? <Icons.IconPause width='1rem' height='1rem' /> :
            <Icons.IconPlay width='1rem' height='1rem' />
          }
          <div class='track-time-remaining'>{formatTime(data.total)}</div>
        </div>

        <div class='track-progress'>
          <div
            class='track-progress-completed'
            style={{
              width: `${progress === Math.floor(data.total / 1000) ? 100 : Math.min(progress * 1000 / data.total * 100, 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}
