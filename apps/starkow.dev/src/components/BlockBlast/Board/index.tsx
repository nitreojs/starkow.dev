import { FC, JSX, memo } from 'preact/compat'

import type { Board } from '@starkow.dev/block-blast-engine'
import type { Ghost } from '@starkow.dev/hooks'

import { colorForPiece, GHOST_INVALID_COLOR } from '../palette'

// fallback for filled cells whose source piece id isn't tracked (shouldn't happen post-fix)
const EMPTY_PIECE_FALLBACK_COLOR = '#3a3a3a'

interface BlockBlastBoardProps {
  board: Board
  cellSize: number
  ghost: Ghost
  ghostPiece: { cells: readonly (readonly [number, number])[], id: string } | null
  cellPieceIds?: readonly (string | null)[]
  clearing?: { rows: readonly number[], cols: readonly number[] } | null
  // cells that should play the placement animation; empty otherwise
  lastPlacedCells?: readonly number[]
}

const pendingClearsFor = (
  board: Board,
  ghost: Ghost,
  ghostPiece: BlockBlastBoardProps['ghostPiece']
): { rows: Set<number>, cols: Set<number> } => {
  const result = { rows: new Set<number>(), cols: new Set<number>() }
  if (ghost === null || !ghost.valid || ghostPiece === null) return result

  const size = board.size
  const sim = new Uint8Array(board.cells)
  for (const [dr, dc] of ghostPiece.cells) {
    sim[(ghost.r + dr) * size + (ghost.c + dc)] = 1
  }

  for (let r = 0; r < size; r++) {
    let full = true
    for (let c = 0; c < size; c++) {
      if (sim[r * size + c] === 0) { full = false; break }
    }
    if (full) result.rows.add(r)
  }
  for (let c = 0; c < size; c++) {
    let full = true
    for (let r = 0; r < size; r++) {
      if (sim[r * size + c] === 0) { full = false; break }
    }
    if (full) result.cols.add(c)
  }
  return result
}

export const BlockBlastBoard: FC<BlockBlastBoardProps> = memo(({ board, cellSize, ghost, ghostPiece, cellPieceIds, clearing, lastPlacedCells }) => {
  const size = board.size
  const totalPx = size * cellSize
  const pending = pendingClearsFor(board, ghost, ghostPiece)
  const popSet = lastPlacedCells !== undefined && lastPlacedCells.length > 0
    ? new Set(lastPlacedCells)
    : null

  const cells: JSX.Element[] = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c
      const filled = board.get(r, c) !== 0
      const pid = cellPieceIds?.[idx] ?? null
      const bg = filled ? (pid !== null ? colorForPiece(pid) : EMPTY_PIECE_FALLBACK_COLOR) : undefined
      const isClearing = clearing != null && (clearing.rows.includes(r) || clearing.cols.includes(c)) && filled
      const isPending = !isClearing && (pending.rows.has(r) || pending.cols.has(c))
      const justPlaced = popSet !== null && popSet.has(idx)

      const className = [
        'bb-cell',
        filled && justPlaced ? 'bb-cell-pop' : '',
        isClearing ? 'bb-cell-clearing' : '',
        isPending ? 'bb-cell-pending' : ''
      ].filter(Boolean).join(' ')

      cells.push(
        <div
          key={`${r}-${c}`}
          class={className}
          style={{
            position: 'absolute',
            top: r * cellSize,
            left: c * cellSize,
            width: cellSize - 2,
            height: cellSize - 2,
            background: bg
          }}
          aria-hidden='true'
        />
      )
    }
  }

  const ghostOverlay: JSX.Element[] = []
  if (ghost !== null && ghostPiece !== null) {
    const color = ghost.valid ? colorForPiece(ghostPiece.id) : GHOST_INVALID_COLOR
    for (const [dr, dc] of ghostPiece.cells) {
      ghostOverlay.push(
        <div
          key={`g-${dr}-${dc}`}
          class='bb-ghost-cell'
          style={{
            position: 'absolute',
            top: (ghost.r + dr) * cellSize,
            left: (ghost.c + dc) * cellSize,
            width: cellSize - 2,
            height: cellSize - 2,
            background: color,
            opacity: ghost.valid ? 0.8 : 0.45,
            borderRadius: 3,
            pointerEvents: 'none'
          }}
        />
      )
    }
  }

  return (
    <div
      class='bb-board'
      role='grid'
      aria-label={`blockblast ${size}×${size} board`}
      style={{ position: 'relative', width: totalPx, height: totalPx }}
    >
      {cells}
      {ghostOverlay}
    </div>
  )
})
