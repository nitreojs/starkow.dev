import { useEffect, useRef } from 'preact/hooks'
import { FC } from 'preact/compat'
import clsx from 'clsx'

import './style.css'

import type { Lyric } from '../../types'

interface LyricsProps {
  lyrics: Lyric[] | null
  index: number
}

export const TrackLyrics: FC<LyricsProps> = ({ lyrics, index }) => {
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
  )
}
