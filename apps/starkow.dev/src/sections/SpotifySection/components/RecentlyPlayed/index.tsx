import { FC } from 'preact/compat'

import type { TrackData } from '../../types'

import './style.css'

interface RecentlyPlayedProps {
  tracks: TrackData[]
}

export const RecentlyPlayed: FC<RecentlyPlayedProps> = ({ tracks }) => {
  if (tracks.length === 0) {
    return null
  }

  return (
    <div class='recently-played'>
      <p class='recently-played-heading text-half-visible text-small'>recently played</p>

      <ul class='recently-played-list'>
        {tracks.slice(0, 3).map(t => (
          <li key={t.id}>
            <a class='recently-played-item' href={t.url} target='_blank' rel='noopener noreferrer'>
              <img class='recently-played-cover' src={t.album.image} alt={t.album.name} />

              <div class='recently-played-text'>
                <span class='recently-played-name'>{t.name}</span>
                <span class='recently-played-artists text-half-visible'>{t.artists.join(', ')}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
