import { FC, useEffect, useRef, useState } from 'preact/compat'
import clsx from 'clsx'

import { API_URL } from '../../shared'

import './style.css'

import type { Lyric, TrackData } from './types'
import { TrackImage, TrackInfo, TrackLyrics } from './components'

const getLyricByTime = (lyrics: Lyric[], time: number) => {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (time >= lyrics[i].time) {
      return { entry: lyrics[i], index: i }
    }
  }

  return null
}

const SpotifyContent: FC = () => {
  const [loading, setLoading] = useState(true)

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

  const renderInnerContent = () => {
    if (loading) {
      return (
        <>
          <p>loading track data...</p>
        </>
      )
    }

    if (trackData === null) {
      return (
        <>
          <div class='no-track-playing'>
            <p>no track is playing...</p>
            <p class='text-small text-half-visible'>perhaps try checking out later?</p>
          </div>
        </>
      )
    }

    return (
      <>
        <img class='track-background' src={trackData.album.image} alt={trackData.album.name} />

        <TrackLyrics lyrics={trackData.lyrics} index={lyricIndex} />
        <TrackImage data={trackData} />
        <TrackInfo data={trackData} progress={progressSeconds} />
      </>
    )
  }

  return (
    <div class={clsx('spotify-track', loading && 'loading')}>
      {renderInnerContent()}
    </div>
  )
}

export const SpotifySection: FC = () => {
  return (
    <section id='spotify'>
      <h2>currently playing</h2>
      <p>
        below lies the track that i'm currently listening to on spotify...
        or, well, simply nothing if i'm not listening to anything atm :P
      </p>

      <SpotifyContent />

      <p class='text-small text-half-visible'>
        this data is approximate and may be delayed by a few seconds.
      </p>
    </section>
  )
}