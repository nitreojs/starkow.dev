import { useCallback, useEffect, useRef, useState } from 'preact/compat'

import type { Board, Piece } from '@starkow.dev/block-blast-engine'

import type { Ghost, TrayIndex } from './types'

const TOUCH_LIFT_CELLS = 2
const TAP_THRESHOLD_PX = 6

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
  onDrop: (trayIndex: TrayIndex, r: number, c: number) => void,
  tray: readonly (Piece | null)[]
) => {
  const [draggingIndex, setDraggingIndex] = useState<TrayIndex | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<TrayIndex | null>(null)
  const [pointerPos, setPointerPos] = useState<{ x: number, y: number } | null>(null)
  const [ghost, setGhost] = useState<Ghost>(null)
  const [pointerType, setPointerType] = useState<'mouse' | 'pen' | 'touch'>('mouse')

  const stateRef = useRef<{ drag: DragStart | null, rafId: number | null }>({ drag: null, rafId: null })
  const ghostRef = useRef<Ghost>(null)
  useEffect(() => { ghostRef.current = ghost }, [ghost])

  // if the selected piece disappears (e.g. tray refresh, rescue swap), drop the selection
  useEffect(() => {
    if (selectedIndex === null) return
    if (tray[selectedIndex] === null || tray[selectedIndex] === undefined) {
      setSelectedIndex(null)
      setGhost(null)
    }
  }, [tray, selectedIndex])

  const resolvePlacement = useCallback((piece: Piece, clientX: number, clientY: number, liftCells: number) => {
    const rect = getBoardRect()
    if (rect === null) return null
    const liftY = -liftCells * cellSize
    const localX = clientX - rect.left
    const localY = clientY - rect.top + liftY
    const c = Math.round(localX / cellSize - piece.width / 2)
    const r = Math.round(localY / cellSize - piece.height / 2)
    const valid = board.canPlace(piece, r, c)
    const withinGrid = r >= 0 && c >= 0 && r < board.size && c < board.size
    return { r, c, valid, withinGrid }
  }, [board, cellSize, getBoardRect])

  const updateGhost = useCallback((clientX: number, clientY: number) => {
    const drag = stateRef.current.drag
    if (drag === null) return

    const lift = drag.pointerType === 'touch' ? TOUCH_LIFT_CELLS : 0
    const g = resolvePlacement(drag.piece, clientX, clientY, lift)
    if (g === null) return

    const showGhost = g.valid || g.withinGrid
    setGhost(prev => {
      if (showGhost) {
        if (prev !== null && prev.pieceId === drag.piece.id && prev.r === g.r && prev.c === g.c && prev.valid === g.valid) {
          return prev
        }
        return { pieceId: drag.piece.id, r: g.r, c: g.c, valid: g.valid }
      }
      return prev === null ? prev : null
    })
  }, [resolvePlacement])

  const start = useCallback((piece: Piece, trayIndex: TrayIndex, e: PointerEvent) => {
    const rect = getBoardRect()
    if (rect === null) return

    const pt = (e.pointerType as 'mouse' | 'pen' | 'touch') ?? 'mouse'
    const startX = e.clientX
    const startY = e.clientY
    let dragging = false

    setPointerType(pt)

    const enterDrag = () => {
      dragging = true
      stateRef.current.drag = {
        piece,
        trayIndex,
        pointerType: pt,
        startX,
        startY,
        boardRect: rect,
        cellSize
      }
      setDraggingIndex(trayIndex)
      setPointerPos({ x: startX, y: startY })
      // dragging takes over from any prior tap-selection
      setSelectedIndex(null)
      updateGhost(startX, startY)
    }

    const onMove = (ev: PointerEvent) => {
      if (!dragging) {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (dx * dx + dy * dy <= TAP_THRESHOLD_PX * TAP_THRESHOLD_PX) return
        enterDrag()
      }
      if (stateRef.current.rafId !== null) return
      const x = ev.clientX
      const y = ev.clientY
      stateRef.current.rafId = requestAnimationFrame(() => {
        stateRef.current.rafId = null
        setPointerPos({ x, y })
        updateGhost(x, y)
      })
    }

    const teardown = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('blur', onCancel)
      if (stateRef.current.rafId !== null) cancelAnimationFrame(stateRef.current.rafId)
      stateRef.current.rafId = null
    }

    const endDrag = () => {
      teardown()
      stateRef.current.drag = null
      setDraggingIndex(null)
      setPointerPos(null)
      setGhost(null)
    }

    const onUp = () => {
      if (dragging) {
        const g = ghostRef.current
        const drag = stateRef.current.drag
        if (g !== null && g.valid && drag !== null) {
          onDrop(drag.trayIndex, g.r, g.c)
        }
        endDrag()
        return
      }
      // tap → toggle selection, keep any existing ghost cleared
      teardown()
      setSelectedIndex(prev => prev === trayIndex ? null : trayIndex)
      setGhost(null)
    }

    const onCancel = () => {
      if (dragging) endDrag()
      else teardown()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('blur', onCancel)
  }, [cellSize, getBoardRect, onDrop, updateGhost])

  // hover preview for a selected piece — mouse/pen only; touch has no hover
  const boardHover = useCallback((e: PointerEvent) => {
    if (draggingIndex !== null || selectedIndex === null) return
    if (e.pointerType === 'touch') return
    const piece = tray[selectedIndex]
    if (piece === null || piece === undefined) return
    const g = resolvePlacement(piece, e.clientX, e.clientY, 0)
    if (g === null) return
    const show = g.valid || g.withinGrid
    setGhost(prev => {
      if (show) {
        if (prev !== null && prev.pieceId === piece.id && prev.r === g.r && prev.c === g.c && prev.valid === g.valid) return prev
        return { pieceId: piece.id, r: g.r, c: g.c, valid: g.valid }
      }
      return prev === null ? prev : null
    })
  }, [draggingIndex, selectedIndex, tray, resolvePlacement])

  const boardLeave = useCallback(() => {
    if (draggingIndex !== null) return
    if (selectedIndex === null) return
    setGhost(null)
  }, [draggingIndex, selectedIndex])

  // commit placement for a selected piece on tap
  const boardTap = useCallback((e: PointerEvent) => {
    if (draggingIndex !== null || selectedIndex === null) return
    const piece = tray[selectedIndex]
    if (piece === null || piece === undefined) return
    const lift = e.pointerType === 'touch' ? TOUCH_LIFT_CELLS : 0
    const g = resolvePlacement(piece, e.clientX, e.clientY, lift)
    if (g === null) return
    if (g.valid) {
      onDrop(selectedIndex, g.r, g.c)
      setSelectedIndex(null)
      setGhost(null)
    }
  }, [draggingIndex, selectedIndex, tray, resolvePlacement, onDrop])

  const clearSelection = useCallback(() => {
    setSelectedIndex(null)
    setGhost(null)
  }, [])

  return {
    draggingIndex,
    selectedIndex,
    pointerPos,
    ghost,
    start,
    pointerType,
    boardHover,
    boardLeave,
    boardTap,
    clearSelection
  }
}
