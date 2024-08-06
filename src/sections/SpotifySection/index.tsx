import { FC, useEffect, useState } from 'preact/compat'
import clsx from 'clsx'

import { IconExternalLink, IconPause, IconPlay, IconSpotify } from '../../icons'
import { API_URL } from '../../shared'

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)

  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const SpotifySection: FC = () => {
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('loading track data...')
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)

  let lastUpdatedAt = Date.now()

  const updateData = (data: Record<string, any> | null) => {
    setData(data)

    lastUpdatedAt = Date.now()

    if (data !== null) {
      setProgress(data.progress)
      setPaused(!JSON.parse(data.playing))
    }
  }

  useEffect(() => {
    const sse = new EventSource(`${API_URL}/api/spotify`)

    sse.addEventListener('track:current', (event) => {
      const parsed = JSON.parse(event.data) as Record<string, any> | null

      setLoading(false)
      updateData(parsed)
    })

    sse.addEventListener('track:play', (event) => {
      const parsed = JSON.parse(event.data) as Record<string, any> | null

      setLoading(false)
      updateData(parsed)
    })
  
    sse.addEventListener('track:pause', (event) => {
      const parsed = JSON.parse(event.data) as Record<string, any> | null

      setLoading(false)
      updateData(parsed)
    })
  
    sse.addEventListener('track:resume', (event) => {
      const parsed = JSON.parse(event.data) as Record<string, any> | null

      setLoading(false)
      updateData(parsed)
    })

    sse.onerror = () => {
      setLoading(true)
      setDescription('something went wrong...')
    }

    return () => {
      sse.close()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (paused) {
        return
      }

      setProgress(Math.min(progress + Date.now() - lastUpdatedAt, data?.total ?? 0))
    }, 500)

    return () => clearInterval(interval)
  }, [data?.progress, lastUpdatedAt, paused])

  return (
    <section id='spotify'>
      <h2>currently playing</h2>
      <p>
        below lies the track that i'm currently listening to on spotify...
        or, well, simply nothing if i'm not listening to anything atm :P
      </p>

      <div class={clsx('spotify-track', loading && 'loading')}>
        {
          loading ? (
            <p>{description}</p>
          ) : (
            data === null ? (
              <div class='no-track-playing'>
                <p>no track is playing...</p>
                <p class='text-small text-half-visible'>perhaps try checking out later?</p>
              </div>
            ) : (
              <>
                <img class='track-background' src={data.album.image} alt={data.album.name} />
                <a class='track-image' href={data.url}>
                  <img src={data.album.image} alt={data.album.name} />
                  <div class='track-image-link'>
                    <IconExternalLink />
                  </div>
                </a>
                <div class='track-info'>
                  <div class='track-data-container'>
                    <div class='track-text-info'>
                      <p class='track-name'>
                        <b>{data.name}</b>
                      </p>
                      <p class='track-artists'>
                        <span class='text-half-visible'>by</span> {data?.artists.join(', ')}
                      </p>
                    </div>
                    <div class='track-button'>
                      <IconSpotify />
                    </div>
                  </div>
                  <div class='track-timer'>
                    <div class='track-time'>
                      <div class='track-time-elapsed'>{formatTime(progress)}</div>
                      {paused ? <IconPause width='1rem' height='1rem' /> : <IconPlay width='1rem' height='1rem' />}
                      <div class='track-time-remaining'>{formatTime(data.total)}</div>
                    </div>
                    <div class='track-progress'>
                      <div
                        class='track-progress-completed'
                        style={{
                          width: `${Math.min(progress / data.total * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )
          )
        }
      </div>

      <p class='text-small text-half-visible'>
        this data is approximate and may be delayed by a few seconds.
      </p>
    </section>
  )
}