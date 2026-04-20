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

export const Tile: FC<TileProps> = ({ letter, state, index = 0, revealing = false, active = false, popping = false, hideLetter = false }) => {
  const style: JSX.CSSProperties = {}

  if (revealing) style.animationDelay = `${index * 120}ms`

  const color = colorVar(state ?? null)
  if (color !== undefined) (style as Record<string, string>)['--wdl-color'] = color

  // during reveal the flip keyframe owns the background; the static colour class
  // would otherwise paint the final colour before the flip even starts.
  const classes = [
    'wdl-tile',
    revealing ? '' : cellClass(state ?? null),
    revealing ? 'wdl-tile-flip' : '',
    popping ? 'wdl-tile-pop' : '',
    active && (letter ?? '') !== '' ? 'wdl-tile-active' : ''
  ].filter(Boolean).join(' ')

  const shown = hideLetter ? '' : (letter ?? '').toUpperCase()

  return (
    <div class={classes} style={style}>
      <span class='wdl-tile-face'>{shown}</span>
    </div>
  )
}
