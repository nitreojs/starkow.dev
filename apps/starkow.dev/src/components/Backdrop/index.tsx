import type { FC } from 'preact/compat'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useAtomValue } from 'jotai'
import clsx from 'clsx'

import { ambientEnabled$atom, nowPlaying$atom } from '../../state'

import './style.css'

const AMBIENT_REFERENCE_LUMA = 0.25
const AMBIENT_MIN_GAIN = 0.35
const AMBIENT_MAX_GAIN = 1.2
const AMBIENT_SATURATION = 1.6
const LUMA_SAMPLE_SIZE = 16

interface Cover {
  id: number
  src: string
  gain: number | null
}

const coverGain = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = LUMA_SAMPLE_SIZE
  canvas.height = LUMA_SAMPLE_SIZE

  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (ctx === null) {
    return 1
  }

  ctx.drawImage(image, 0, 0, LUMA_SAMPLE_SIZE, LUMA_SAMPLE_SIZE)

  const { data } = ctx.getImageData(0, 0, LUMA_SAMPLE_SIZE, LUMA_SAMPLE_SIZE)
  let sum = 0

  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
  }

  const luma = sum / (data.length / 4) / 255

  return Math.min(AMBIENT_MAX_GAIN, Math.max(AMBIENT_MIN_GAIN, AMBIENT_REFERENCE_LUMA / Math.max(luma, 0.01)))
}

export const Backdrop: FC = () => {
  const enabled = useAtomValue(ambientEnabled$atom)
  const track = useAtomValue(nowPlaying$atom)
  const image = track?.album.image
  const [covers, setCovers] = useState<Cover[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    if (!enabled || image === undefined) {
      return
    }

    setCovers(prev => (prev[prev.length - 1]?.src === image ? prev : [...prev, { id: nextId.current++, src: image, gain: null }]))
  }, [enabled, image])

  const shownId = covers.reduce((max, cover) => (cover.gain !== null && cover.id > max ? cover.id : max), -1)

  return (
    <div
      class={clsx('backdrop-ambient', enabled && track !== null && (track.playing ? 'backdrop-ambient-playing' : 'backdrop-ambient-paused'))}
      aria-hidden='true'
    >
      <div class='backdrop-ambient-stage'>
        {covers.map(cover => (
          <img
            key={cover.id}
            class={clsx('backdrop-ambient-cover', cover.id === shownId && 'backdrop-ambient-cover-shown')}
            style={cover.gain === null ? undefined : `--ambient-level: ${cover.gain / AMBIENT_MAX_GAIN}; --ambient-saturation: ${AMBIENT_SATURATION / cover.gain}`}
            src={cover.src}
            alt=''
            decoding='async'
            crossOrigin='anonymous'
            onLoad={(event) => {
              const gain = coverGain(event.currentTarget)

              setCovers(prev => prev.map(c => (c.id === cover.id ? { ...c, gain } : c)))
            }}
            onError={() => setCovers(prev => prev.filter(c => c.id !== cover.id))}
            onTransitionEnd={() => setCovers((prev) => {
              const newestShown = prev.reduce((max, c) => (c.gain !== null && c.id > max ? c.id : max), -1)

              return prev.filter(c => c.id >= newestShown)
            })}
          />
        ))}
      </div>
    </div>
  )
}
