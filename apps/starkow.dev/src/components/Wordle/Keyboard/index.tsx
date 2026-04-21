import { FC } from 'preact/compat'

import type { Cell, Lang } from '@starkow.dev/wordle-engine'

import { Key } from '../Key'

import { getLayout } from './layouts'

interface KeyboardProps {
  lang: Lang
  keyState: Record<string, Cell>
  onLetter: (l: string) => void
  onBackspace: () => void
  onSubmit: () => void
  disabled?: boolean
  swapEnter?: boolean
}

export const Keyboard: FC<KeyboardProps> = ({ lang, keyState, onLetter, onBackspace, onSubmit, disabled = false, swapEnter = false }) => {
  const base = getLayout(lang)

  const rows = swapEnter
    ? base.map(row => {
      const first = row[0]
      const last = row[row.length - 1]

      if (first?.kind === 'enter' && last?.kind === 'back') {
        return [last, ...row.slice(1, -1), first]
      }

      return row
    })
    : base

  return (
    <div class={`wdl-keyboard${disabled ? ' wdl-keyboard-disabled' : ''}`} aria-disabled={disabled}>
      {rows.map((row, ri) => (
        <div class='wdl-keyboard-row' key={ri}>
          {row.map((k, ki) => (
            <Key
              key={`${ri}:${ki}`}
              kind={k.kind}
              label={k.label}
              state={k.kind === 'letter' ? (keyState[k.key!] ?? null) : null}
              wide={k.kind !== 'letter'}
              onPress={() => {
                if (k.kind === 'letter') onLetter(k.key!)
                else if (k.kind === 'enter') onSubmit()
                else onBackspace()
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
