import { FC, Fragment } from 'preact/compat'

import * as Icons from '@starkow.dev/icons'

import type { TrackData } from '../../types'

import './style.css'

interface TrackInfoProps {
  data: TrackData
  progress: number // seconds
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const TrackInfo: FC<TrackInfoProps> = ({ data, progress }) => {
  const elapsedMs = Math.min(progress * 1000, data.total)
  const percentComplete = data.total > 0 ? (elapsedMs / data.total) * 100 : 0

  return (
    <div class='track-info'>
      <div class='track-data-container'>
        <div class='track-text-info'>
          <p class='track-name'>
            <b>{data.name}</b>
          </p>
          <p class='track-artists'>
            <span class='text-half-visible'>by</span>{' '}
            {data.artists.map((artist, i) => (
              <Fragment key={artist.url}>
                {i > 0 && <span class='text-half-visible'>, </span>}
                <a
                  class='track-artist'
                  href={artist.url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {artist.name}
                </a>
              </Fragment>
            ))}
          </p>
        </div>

        <div class='track-button'>
          <Icons.IconSpotify />
        </div>
      </div>

      <div class='track-timer'>
        <div class='track-time'>
          <div class='track-time-elapsed'>{formatTime(elapsedMs)}</div>

          <div class='track-play-state' key={data.playing ? 'play' : 'pause'}>
            {data.playing ? <Icons.IconPlay /> : <Icons.IconPause />}
          </div>

          <div class='track-time-remaining'>{formatTime(data.total)}</div>
        </div>

        <div class='track-progress'>
          <div
            class='track-progress-completed'
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  )
}
