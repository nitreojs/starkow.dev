import { FC, useEffect, useRef, useState } from 'preact/compat'
import clsx from 'clsx'

import * as Icons from '@starkow.dev/icons'
import { API_URL } from '../../shared'

import './style.css'

interface Lyric {
  time: number
  lyric: string
}

interface TrackDataAlbum {
  name: string
  image: string
}

interface TrackData {
  id: string
  album: TrackDataAlbum
  artists: string[]
  name: string
  url: string
  playing: boolean

  progress: number // ms
  total: number // ms

  lyrics: Lyric[] | null
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)

  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getLyricByTime = (lyrics: Lyric[], time: number) => {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (time >= lyrics[i].time) {
      return { entry: lyrics[i], index: i }
    }
  }

  return null
}

interface LyricsProps {
  lyrics: Lyric[] | null
  index: number
}

const Lyrics: FC<LyricsProps> = ({ lyrics, index }) => {
  const parentRef = useRef<HTMLDivElement>(null)

  // info: translate offset calculation
  useEffect(() => {
    if (parentRef.current) {
      const children = [...parentRef.current.children] as HTMLDivElement[]

      if (children.length === 0) {
        parentRef.current.style.translate = `0 0px`
      } else {
        const heights = children.map(d => d.offsetTop)
        const neededOffset = heights[index]

        parentRef.current.style.translate = `0 -${neededOffset}px`
      }
    }
  }, [index])

  return (
    // <div class='track-lyrics-mask'>
      <div
        class='track-lyrics'
        ref={parentRef}
        data-has-lyrics={lyrics !== null && lyrics.length > 0}
      >
        {
          lyrics?.map(({ time, lyric }, i) => {
            const isPlaying = i === index
            const isAround = i === index + 1
        
            return (
              <div
                key={time}
                class={clsx('track-lyric', isPlaying && 'track-lyric-playing', isAround && 'track-lyric-around-playing')}
              >
                {lyric}
              </div>
            )
          })
        }
      </div>
    // </div>
  )
}

export const SpotifySection: FC = () => {
  const [loading, setLoading] = useState(true)

  const [description] = useState('loading track data...')

  const [trackData, setTrackData] = useState<TrackData | null>(null)

  const progressRef = useRef<number>(0)

  const [progressSeconds, setProgressSeconds] = useState(0)
  const [lyricIndex, setLyricIndex] = useState(0)

  const handleSSEMessage = (event: MessageEvent<string>) => {
    const parsed = JSON.parse(event.data) as TrackData

    setLoading(false)
    setTrackData(JSON.parse(event.data))

    progressRef.current = parsed.progress

    setProgressSeconds(Math.floor(parsed.progress / 1000))
  }

  // info: SSE
  useEffect(() => {
    const sse = new EventSource(`${API_URL}/api/spotify`)

    sse.addEventListener('track:current', handleSSEMessage)
    sse.addEventListener('track:play', handleSSEMessage)
    sse.addEventListener('track:pause', handleSSEMessage)
    sse.addEventListener('track:resume', handleSSEMessage)

    return () => {
      sse.close()
    }
  }, [])

  // info: RAF
  useEffect(() => {
    let lastSecond = 0
    let lastLyricIndex = 0

    let lastUpdateTime = Date.now()

    const tick = () => {
      if (trackData?.playing) {
        const delta = Date.now() - lastUpdateTime

        progressRef.current = Math.min(progressRef.current + delta, trackData.total)

        const seconds = Math.floor(progressRef.current / 1000)

        if (seconds !== lastSecond) {
          lastSecond = seconds

          setProgressSeconds(seconds)
        }
      }

      if (trackData?.lyrics) {
        const found = getLyricByTime(trackData.lyrics, progressRef.current / 1000)

          if (found === null) {
          lastLyricIndex = -1
          setLyricIndex(-1)
        } else if (lastLyricIndex !== found.index) {
          lastLyricIndex = found.index
          setLyricIndex(found.index)
        }
      }

      lastUpdateTime = Date.now()
      animationFrameID = requestAnimationFrame(tick)
    }

    let animationFrameID = requestAnimationFrame(tick)

    return () => {
      if (animationFrameID !== null) {
        cancelAnimationFrame(animationFrameID)
      }
    }
  }, [trackData])

  let content = <p>{description}</p>

  if (!loading) {
    if (trackData === null) {
      content = (
        <div class='no-track-playing'>
          <p>no track is playing...</p>
          <p class='text-small text-half-visible'>perhaps try checking out later?</p>
        </div>
      )
    } else {
      content = (
        <>
          <Lyrics lyrics={trackData.lyrics} index={lyricIndex} />

          <img class='track-background' src={trackData.album.image} alt={trackData.album.name} />

          <a class='track-image' href={trackData.url}>
            <img src={trackData.album.image} alt={trackData.album.name} />
            <div class='track-image-link'>
              <Icons.IconExternalLink />
            </div>
          </a>

          <div class='track-info'>
            <div class='track-data-container'>
              <div class='track-text-info'>
                <p class='track-name'>
                  <b>{trackData.name}</b>
                </p>
                <p class='track-artists'>
                  <span class='text-half-visible'>by</span> {trackData.artists.join(', ')}
                </p>
              </div>
              <div class='track-button'>
                <Icons.IconSpotify />
              </div>
            </div>

            <div class='track-timer'>
              <div class='track-time'>
                <div class='track-time-elapsed'>
                  {formatTime(progressSeconds * 1000)}
                </div>
                {
                  !trackData.playing ? <Icons.IconPause width='1rem' height='1rem' /> :
                  <Icons.IconPlay width='1rem' height='1rem' />
                }
                <div class='track-time-remaining'>{formatTime(trackData.total)}</div>
              </div>

              <div class='track-progress'>
                <div
                  class='track-progress-completed'
                  style={{
                    width: `${progressSeconds === Math.floor(trackData.total / 1000) ? 100 : Math.min(progressSeconds * 1000 / trackData.total * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )
    }
  }

  return (
    <section id='spotify'>
      <h2>currently playing</h2>
      <p>
        below lies the track that i'm currently listening to on spotify...
        or, well, simply nothing if i'm not listening to anything atm :P
      </p>

      <div class={clsx('spotify-track', loading && 'loading')}>
        {content}
      </div>

      <p class='text-small text-half-visible'>
        this data is approximate and may be delayed by a few seconds.
      </p>
    </section>
  )
}