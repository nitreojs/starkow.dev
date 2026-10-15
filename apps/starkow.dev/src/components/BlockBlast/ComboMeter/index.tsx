import type { FC } from 'preact/compat'
import clsx from 'clsx'

import { COMBO_MISSES_ALLOWED } from '@starkow.dev/block-blast-engine'

interface BlockBlastComboMeterProps {
  combo: number
  misses: number
}

const LIVES = COMBO_MISSES_ALLOWED + 1

export const BlockBlastComboMeter: FC<BlockBlastComboMeterProps> = ({ combo, misses }) => {
  const livesLeft = LIVES - misses

  return (
    <span class={clsx('bb-combo', livesLeft === 1 && 'bb-combo-last-chance')}>
      combo <b>×{combo}</b>
      <span class='bb-combo-lives' role='img' aria-label={`clear a line within ${livesLeft} ${livesLeft === 1 ? 'placement' : 'placements'} to keep the combo`}>
        {Array.from({ length: LIVES }, (_, i) => (
          <span key={i} class={clsx('bb-combo-life', i < livesLeft && 'bb-combo-life-on')} />
        ))}
      </span>
    </span>
  )
}
