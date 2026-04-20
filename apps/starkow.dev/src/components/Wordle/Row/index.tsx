import { FC } from 'preact/compat'

import type { Cell } from '@starkow.dev/wordle-engine'

import { Tile } from '../Tile'

interface RowProps {
  length: number
  letters?: string
  mask?: Cell[]
  errorAt?: number | null
  revealing?: boolean
  active?: boolean
  hideLetters?: boolean
}

export const Row: FC<RowProps> = ({ length, letters = '', mask, errorAt = null, revealing = false, active = false, hideLetters = false }) => {
  const cells = Array.from({ length }, (_, i) => ({
    letter: letters[i] ?? '',
    state: (mask?.[i] ?? null) as Cell | null,
    index: i
  }))

  // alternating animation names force the keyframe to replay on consecutive errors
  const shakeClass = errorAt !== null
    ? (errorAt % 2 === 0 ? 'wdl-row-shake-a' : 'wdl-row-shake-b')
    : ''

  const classes = ['wdl-row', shakeClass].filter(Boolean).join(' ')

  return (
    <div class={classes}>
      {cells.map(c => {
        // pop only for newly-typed draft letters; revealed tiles use the flip
        const popping = active && c.letter !== '' && c.state === null && !revealing
        // key includes the letter so the pop keyframe replays for each new letter
        const key = `${c.index}:${c.letter}`

        return (
          <Tile
            key={key}
            letter={c.letter}
            state={c.state}
            index={c.index}
            revealing={revealing}
            active={active}
            popping={popping}
            hideLetter={hideLetters}
          />
        )
      })}
    </div>
  )
}
