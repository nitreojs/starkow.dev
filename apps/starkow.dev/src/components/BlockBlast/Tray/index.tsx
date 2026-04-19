import { FC, memo } from 'preact/compat'

import type { Piece } from '@starkow.dev/block-blast-engine'
import type { TrayIndex } from '@starkow.dev/hooks'

import { BlockBlastPiece } from '../Piece'

interface BlockBlastTrayProps {
  tray: readonly (Piece | null)[]
  // pre-computed cell size for tray pieces — page sizes this against viewport width
  trayCellSize: number
  draggingIndex: TrayIndex | null
  selectedIndex: TrayIndex | null
  onPointerDown: (index: TrayIndex, e: PointerEvent) => void
}

// max piece dimension across the catalogue (5x1 / 1x5)
const SLOT_CELLS = 5

export const BlockBlastTray: FC<BlockBlastTrayProps> = memo(({ tray, trayCellSize, draggingIndex, selectedIndex, onPointerDown }) => {
  const slotPx = Math.ceil(SLOT_CELLS * trayCellSize)

  return (
    <div class='bb-tray' role='toolbar' aria-label='available pieces' aria-describedby='bb-keyboard-hint'>
      {tray.map((piece, i) => {
        const isSelected = selectedIndex === i
        return (
          <div
            key={i}
            class={`bb-tray-slot${isSelected ? ' bb-tray-slot-selected' : ''}`}
            style={{ width: slotPx, height: slotPx }}
            tabIndex={piece === null ? -1 : 0}
            aria-label={piece === null ? 'empty tray slot' : `piece ${i + 1} of 3`}
            aria-pressed={piece === null ? undefined : isSelected}
            onPointerDown={piece === null ? undefined : (e) => { e.preventDefault(); onPointerDown(i as TrayIndex, e as unknown as PointerEvent) }}
          >
            {piece !== null && <BlockBlastPiece piece={piece} cellSize={trayCellSize} dim={draggingIndex === i} selected={isSelected} />}
          </div>
        )
      })}
    </div>
  )
})
