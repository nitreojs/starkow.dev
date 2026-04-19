import { useCallback, useEffect, useRef, useState } from 'preact/compat'

import type { Board, Piece } from '@starkow.dev/block-blast-engine'

import type { Ghost, TrayIndex } from './types'

const TOUCH_LIFT_CELLS = 2

export type DragStart = {
  piece: Piece
  trayIndex: TrayIndex
  pointerType: 'mouse' | 'pen' | 'touch'
  startX: number
  startY: number
  boardRect: DOMRect
  cellSize: number
}

export const useBlockBlastDrag = (
  board: Board,
  cellSize: number,
  getBoardRect: () => DOMRect | null,
  onDrop: (trayIndex: TrayIndex, r: number, c: number) => void
) => {
  const [draggingIndex, setDraggingIndex] = useState<TrayIndex | null>(null)
  const [pointerPos, setPointerPos] = useState<{ x: number, y: number } | null>(null)
  const [ghost, setGhost] = useState<Ghost>(null)
  const [pointerType, setPointerType] = useState<'mouse' | 'pen' | 'touch'>('mouse')

  const stateRef = useRef<{ drag: DragStart | null, rafId: number | null }>({ drag: null, rafId: null })
  const ghostRef = useRef<Ghost>(null)
  useEffect(() => { ghostRef.current = ghost }, [ghost])

  const updateGhost = useCallback((clientX: number, clientY: number) => {
    const drag = stateRef.current.drag
    if (drag === null) return

    const rect = drag.boardRect
    const liftY = drag.pointerType === 'touch' ? -TOUCH_LIFT_CELLS * drag.cellSize : 0
    const localX = clientX - rect.left
    const localY = clientY - rect.top + liftY

    const c = Math.round(localX / drag.cellSize - drag.piece.width / 2)
    const r = Math.round(localY / drag.cellSize - drag.piece.height / 2)

    const valid = board.canPlace(drag.piece, r, c)
    const withinGrid = r >= 0 && c >= 0 && r < board.size && c < board.size
    const showGhost = valid || withinGrid

    setGhost(prev => {
      if (showGhost) {
        if (prev !== null && prev.pieceId === drag.piece.id && prev.r === r && prev.c === c && prev.valid === valid) {
          return prev
        }
        return { pieceId: drag.piece.id, r, c, valid }
      }
      return prev === null ? prev : null
    })
  }, [board])

  const start = useCallback((piece: Piece, trayIndex: TrayIndex, e: PointerEvent) => {
    const rect = getBoardRect()
    if (rect === null) return

    const pt = (e.pointerType as 'mouse' | 'pen' | 'touch') ?? 'mouse'

    stateRef.current.drag = {
      piece,
      trayIndex,
      pointerType: pt,
      startX: e.clientX,
      startY: e.clientY,
      boardRect: rect,
      cellSize
    }
    setDraggingIndex(trayIndex)
    setPointerPos({ x: e.clientX, y: e.clientY })
    setPointerType(pt)
    updateGhost(e.clientX, e.clientY)

    const onMove = (ev: PointerEvent) => {
      if (stateRef.current.rafId !== null) return
      const x = ev.clientX
      const y = ev.clientY
      stateRef.current.rafId = requestAnimationFrame(() => {
        stateRef.current.rafId = null
        setPointerPos({ x, y })
        updateGhost(x, y)
      })
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('blur', onCancel)
      if (stateRef.current.rafId !== null) cancelAnimationFrame(stateRef.current.rafId)
      stateRef.current.rafId = null
      stateRef.current.drag = null
      setDraggingIndex(null)
      setPointerPos(null)
      setGhost(null)
    }

    const onUp = () => {
      const g = ghostRef.current
      const drag = stateRef.current.drag
      if (g !== null && g.valid && drag !== null) {
        onDrop(drag.trayIndex, g.r, g.c)
      }
      cleanup()
    }

    const onCancel = () => cleanup()

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('blur', onCancel)
  }, [cellSize, getBoardRect, onDrop, updateGhost])

  return { draggingIndex, pointerPos, ghost, start, pointerType }
}
