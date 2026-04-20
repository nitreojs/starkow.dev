import { FC, useEffect, useState } from 'preact/compat'
import { PIECES } from '@starkow.dev/block-blast-engine'

const excludedIds = new Set([
  '1x2', '2x1',
  'diag-2-fwd', 'diag-2-bwd',
  'diag-3-fwd', 'diag-3-bwd'
])

const decorPieces = PIECES.filter(p => !excludedIds.has(p.id))

const pickRandomPiece = (exclude?: string) => {
  const pool = exclude === undefined ? decorPieces : decorPieces.filter(p => p.id !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]!
}

const pickDelay = () => 5000 + Math.random() * 5000

const CELL = 18
const GAP = 2
const STRIDE = CELL + GAP

interface PieceShapeProps {
  piece: typeof decorPieces[number]
}

const PieceShape: FC<PieceShapeProps> = ({ piece }) => {
  const width = piece.width * STRIDE - GAP
  const height = piece.height * STRIDE - GAP

  return (
    <svg viewBox={`0 0 ${width} ${height}`} xmlns='http://www.w3.org/2000/svg'>
      <g key={piece.id} class='blockblast-decor-piece'>
        {piece.cells.map(([r, c]) => (
          <rect
            key={`${r}-${c}`}
            x={c * STRIDE}
            y={r * STRIDE}
            width={CELL}
            height={CELL}
            rx='3'
          />
        ))}
      </g>
    </svg>
  )
}

const useCyclingPiece = () => {
  const [piece, setPiece] = useState(() => pickRandomPiece())

  useEffect(() => {
    const id = setTimeout(() => setPiece(prev => pickRandomPiece(prev.id)), pickDelay())

    return () => clearTimeout(id)
  }, [piece])

  return piece
}

export const BlockBlastDecorRight: FC = () => {
  const piece = useCyclingPiece()

  return <PieceShape piece={piece} />
}

export const BlockBlastDecorLeft: FC = () => {
  const piece = useCyclingPiece()

  return <PieceShape piece={piece} />
}
