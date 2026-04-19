import { FC, memo } from 'preact/compat'

import type { Piece } from '@starkow.dev/block-blast-engine'

import { BlockBlastPiece } from '../Piece'

interface BlockBlastDragLayerProps {
  piece: Piece | null
  pointerX: number | null
  pointerY: number | null
  cellSize: number
  pointerType: 'mouse' | 'pen' | 'touch'
}

const TOUCH_LIFT_CELLS = 2

export const BlockBlastDragLayer: FC<BlockBlastDragLayerProps> = memo(({ piece, pointerX, pointerY, cellSize, pointerType }) => {
  if (piece === null || pointerX === null || pointerY === null) return null

  const liftY = pointerType === 'touch' ? -TOUCH_LIFT_CELLS * cellSize : 0
  const x = pointerX - (piece.width * cellSize) / 2
  const y = pointerY - (piece.height * cellSize) / 2 + liftY

  return (
    <div
      class='bb-drag-layer'
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: 0.75
      }}
    >
      <BlockBlastPiece piece={piece} cellSize={cellSize} />
    </div>
  )
})
