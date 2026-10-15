import type { FC, Ref } from 'preact/compat'
import clsx from 'clsx'

import type { Piece } from '@starkow.dev/block-blast-engine'

import { BlockBlastPiece } from '../Piece'
import { TRAY_SLOT_CELLS } from '../Tray'

interface BlockBlastHoldSlotProps {
  piece: Piece | null
  trayCellSize: number
  armed: boolean
  hover: boolean
  slotRef: Ref<HTMLButtonElement>
  onTap: () => void
}

export const BlockBlastHoldSlot: FC<BlockBlastHoldSlotProps> = ({ piece, trayCellSize, armed, hover, slotRef, onTap }) => {
  const slotPx = Math.ceil(TRAY_SLOT_CELLS * trayCellSize)

  return (
    <div class='bb-hold'>
      <button
        ref={slotRef}
        type='button'
        class={clsx('bb-hold-slot', piece === null && 'bb-hold-slot-empty', armed && 'bb-hold-slot-armed', hover && 'bb-hold-slot-hover')}
        style={{ width: slotPx, height: slotPx }}
        aria-label={piece === null ? 'empty hold slot' : `held ${piece.width}×${piece.height} piece`}
        onClick={onTap}
      >
        {piece !== null && <BlockBlastPiece piece={piece} cellSize={trayCellSize} />}
      </button>
      <span class='bb-hold-label text-half-visible'>hold</span>
    </div>
  )
}
