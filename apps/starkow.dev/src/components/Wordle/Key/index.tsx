import { FC } from 'preact/compat'

import type { Cell } from '@starkow.dev/wordle-engine'

import type { KeyKind } from '../Keyboard/layouts'

interface KeyProps {
  kind: KeyKind
  label: string
  state?: Cell | null
  wide?: boolean
  onPress: () => void
}

const cls = (c: Cell | null | undefined): string => {
  if (c === 'green') return 'wdl-key-green'
  if (c === 'yellow') return 'wdl-key-yellow'
  if (c === 'gray') return 'wdl-key-gray'
  return ''
}

export const Key: FC<KeyProps> = ({ kind, label, state, wide = false, onPress }) => {
  const classes = ['wdl-key', cls(state), wide ? 'wdl-key-wide' : '', kind !== 'letter' ? 'wdl-key-control' : ''].filter(Boolean).join(' ')

  return (
    <button
      class={classes}
      type='button'
      onPointerDown={e => { e.preventDefault(); onPress() }}
    >
      {label}
    </button>
  )
}
