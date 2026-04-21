import { FC, type JSX } from 'preact/compat'

import type { Cell } from '@starkow.dev/wordle-engine'

interface TileProps {
  letter?: string
  state?: Cell | null
  index?: number
  revealing?: boolean
  active?: boolean
  popping?: boolean
  hideLetter?: boolean
  placeholder?: string | null
}

const cellClass = (c: Cell | null | undefined): string => {
  if (c === 'green') return 'wdl-tile-green'
  if (c === 'yellow') return 'wdl-tile-yellow'
  if (c === 'gray') return 'wdl-tile-gray'
  return ''
}

// hex used by the flip keyframe so background only swaps at the 50% mark
const colorVar = (c: Cell | null | undefined): string | undefined => {
  if (c === 'green') return '#5a8a3d'
  if (c === 'yellow') return '#d9b63c'
  if (c === 'gray') return '#3a3a3a'
  return undefined
}

export const Tile: FC<TileProps> = ({ letter, state, index = 0, revealing = false, active = false, popping = false, hideLetter = false, placeholder = null }) => {
  const style: JSX.CSSProperties = {}

  if (revealing) {
    style.animationDelay = `${index * 120}ms`
  }

  const color = colorVar(state ?? null)

  if (color !== undefined) {
    (style as Record<string, string>)['--wdl-color'] = color
  }

  // during reveal the flip keyframe owns the background; the static colour class
  // would otherwise paint the final colour before the flip even starts.
  const classes = [
    'wdl-tile',
    revealing ? '' : cellClass(state ?? null),
    revealing ? 'wdl-tile-flip' : '',
    popping ? 'wdl-tile-pop' : '',
    active && (letter ?? '') !== '' ? 'wdl-tile-active' : ''
  ].filter(Boolean).join(' ')

  const typed = hideLetter ? '' : (letter ?? '').toUpperCase()
  const showPlaceholder = typed === '' && placeholder !== null && placeholder !== ''
  const shown = showPlaceholder ? placeholder!.toUpperCase() : typed

  const faceClasses = ['wdl-tile-face', showPlaceholder ? 'wdl-tile-face-placeholder' : ''].filter(Boolean).join(' ')

  return (
    <div class={classes} style={style}>
      <span class={faceClasses}>{shown}</span>
    </div>
  )
}
