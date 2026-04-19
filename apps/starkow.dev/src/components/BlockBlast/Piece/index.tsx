import { FC } from 'preact/compat'

import type { Piece } from '@starkow.dev/block-blast-engine'

import { colorForPiece } from '../palette'

interface BlockBlastPieceProps {
  piece: Piece
  cellSize: number
  dim?: boolean
  selected?: boolean
}

export const BlockBlastPiece: FC<BlockBlastPieceProps> = ({ piece, cellSize, dim = false, selected = false }) => {
  const color = colorForPiece(piece.id)

  return (
    <div
      class={`bb-piece${selected ? ' bb-piece-selected' : ''}`}
      role='img'
      aria-label={`${piece.width}×${piece.height} piece`}
      style={{
        position: 'relative',
        width: piece.width * cellSize,
        height: piece.height * cellSize,
        opacity: dim ? 0.3 : 1
      }}
    >
      {piece.cells.map(([r, c], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: r * cellSize,
            left: c * cellSize,
            width: cellSize - 2,
            height: cellSize - 2,
            borderRadius: 3,
            background: color
          }}
        />
      ))}
    </div>
  )
}
