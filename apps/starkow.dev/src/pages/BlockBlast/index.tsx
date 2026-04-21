import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'preact/compat'

import { MODES, type ModeId } from '@starkow.dev/block-blast-engine'
import {
  canResumeMode,
  clearSave,
  getHaptics,
  getSave,
  setHaptics,
  serializeBlockBlastGame,
  useBlockBlastAchievements,
  useBlockBlastDrag,
  useBlockBlastGame,
  useTitleSuffix,
  writeSave,
  type ResumableSave,
  type TrayIndex
} from '@starkow.dev/hooks'

import {
  BlockBlastAchievements,
  BlockBlastBoard,
  BlockBlastDragLayer,
  BlockBlastGameOver,
  BlockBlastModeTabs,
  BlockBlastTray
} from '../../components'

import './style.css'

const SAVE_DEBOUNCE_MS = 500
// when a fresh tray sits unplayed for this long, swap unplaced pieces with a rescue set
const HESITATION_RESCUE_MS = 8000
const randomSeed = () => Math.floor(Math.random() * 0xffffffff) >>> 0

const computeCellSize = (boardSize: number): number => {
  if (typeof window === 'undefined') return 44
  const available = Math.min(window.innerWidth - 64, 820)
  const raw = Math.floor(available / boardSize)
  return Math.max(28, Math.min(56, raw))
}

// largest piece dimension in the catalogue — drives tray slot size
const TRAY_SLOT_CELLS = 5

// tray cell size: shrink past 0.7×boardCell to keep 3 slots + tray padding/gaps within viewport width
const computeTrayCellSize = (boardCellSize: number): number => {
  const ideal = boardCellSize * 0.7
  if (typeof window === 'undefined') return ideal
  // tray css: padding 0.5em + 2 gaps of 0.5em ≈ 32px of non-slot width
  // also subtract a small page-margin allowance so the tray never kisses the viewport edge
  const slotsBudget = window.innerWidth - 32 - 16
  const maxByViewport = slotsBudget / (3 * TRAY_SLOT_CELLS)
  return Math.max(14, Math.floor(Math.min(ideal, maxByViewport)))
}

export const BlockBlastPage: FC = () => {
  useTitleSuffix('blockblast')

  const [mode, setMode] = useState<ModeId>('classic')
  const [seed, setSeed] = useState<number>(randomSeed)
  const [gameKey, setGameKey] = useState<number>(0)

  const [haptics, setHapticsState] = useState<boolean>(getHaptics())

  const [resumePrompt, setResumePrompt] = useState<{ mode: 'classic' | 'big-board', save: ResumableSave } | null>(null)

  const boardRef = useRef<HTMLDivElement | null>(null)
  const getBoardRect = useCallback(() => {
    const inner = boardRef.current?.querySelector('.bb-board')
    return inner?.getBoundingClientRect() ?? null
  }, [])

  const { state, place, reset, hydrateFrom, rescueTray } = useBlockBlastGame({ mode, seed })

  const [cellSize, setCellSize] = useState<number>(() => computeCellSize(MODES[mode].boardSize))
  const [trayCellSize, setTrayCellSize] = useState<number>(() => computeTrayCellSize(computeCellSize(MODES[mode].boardSize)))
  useEffect(() => {
    const recompute = () => {
      const next = computeCellSize(state.board.size)
      setCellSize(next)
      setTrayCellSize(computeTrayCellSize(next))
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [state.board.size])

  useEffect(() => {
    if (resumePrompt !== null) return
    reset(mode, seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seed, gameKey])

  // when mode changes, check for a save
  useEffect(() => {
    if (!canResumeMode(mode)) {
      setResumePrompt(null)
      return
    }
    const save = getSave(mode)
    if (save !== null && save.movesMade > 0) {
      setResumePrompt({ mode, save })
    } else {
      setResumePrompt(null)
    }
  }, [mode])

  // throttled save-on-change
  const saveTimerRef = useRef<number | null>(null)
  useEffect(() => {
    if (!canResumeMode(mode)) return
    if (state.status === 'game-over') {
      clearSave(mode)
      return
    }
    if (state.movesMade === 0) return

    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      writeSave(mode, serializeBlockBlastGame(state))
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    }
  }, [state, mode])

  const onDrop = useCallback((i: TrayIndex, r: number, c: number) => {
    place(i, r, c)
  }, [place])

  const {
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
  } = useBlockBlastDrag(state.board, cellSize, getBoardRect, onDrop, state.tray)
  const { unlocks, tryUnlock } = useBlockBlastAchievements()

  // hesitation rescue: if the player hasn't placed in a while, ask the engine to swap
  // unplaced tray slots for a guaranteed-helpful set
  const rescueTimerRef = useRef<number | null>(null)
  useEffect(() => {
    if (state.status !== 'playing') return
    if (resumePrompt !== null) return
    // dragging — don't interrupt
    if (draggingIndex !== null) return
    if (rescueTimerRef.current !== null) window.clearTimeout(rescueTimerRef.current)
    rescueTimerRef.current = window.setTimeout(() => { rescueTray() }, HESITATION_RESCUE_MS)
    return () => {
      if (rescueTimerRef.current !== null) window.clearTimeout(rescueTimerRef.current)
    }
    // tray reference changes on placement and rescue — both should reset the timer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tray, state.movesMade, state.status, resumePrompt, draggingIndex])

  const lastMovesRef = useRef(0)
  useEffect(() => {
    if (state.movesMade === lastMovesRef.current) return
    lastMovesRef.current = state.movesMade

    if (state.movesMade === 1) tryUnlock('first-placement')
    if (state.lastCleared !== null) {
      const lines = state.lastCleared.rows.length + state.lastCleared.cols.length
      if (lines >= 1) tryUnlock('first-line-clear')
      if (lines === 2) tryUnlock('double-line-clear')
      if (lines >= 3) tryUnlock('triple-line-clear')
      if (haptics && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(10)
      }
    }
    if (state.score >= 1000) tryUnlock('reach-1k')
    if (state.score >= 5000) tryUnlock('reach-5k')
    if (state.score >= 10000) tryUnlock('reach-10k')
    if (state.movesMade >= 100) tryUnlock('survive-100')
    if (state.movesMade >= 200) tryUnlock('survive-200')
    if (state.streak >= 5) tryUnlock('streak-5')
    if (state.streak >= 10) tryUnlock('streak-10')

    const anyBigSquare = state.cellPieceIds.some(id => id === '3x3')
    if (anyBigSquare) tryUnlock('place-3x3')
  }, [state, haptics, tryUnlock])

  const onPieceDown = useCallback((index: TrayIndex, e: PointerEvent) => {
    const piece = state.tray[index]
    if (piece === null || piece === undefined) return
    start(piece, index, e)
  }, [state.tray, start])

  const onRetry = useCallback(() => {
    if (canResumeMode(mode)) clearSave(mode)
    clearSelection()
    setSeed(randomSeed())
    setGameKey(k => k + 1)
  }, [mode, clearSelection])

  const onModeChange = useCallback((m: ModeId) => {
    if (m === mode) return

    const isMidRun = state.movesMade > 0
      && state.status === 'playing'
      && (mode === 'classic' || mode === 'big-board')

    if (isMidRun) {
      const ok = window.confirm(`abandon current ${mode} run?`)
      if (!ok) return
      if (mode === 'classic' || mode === 'big-board') {
        clearSave(mode)
      }
    }
    clearSelection()
    setMode(m)
    setSeed(randomSeed())
  }, [mode, state.movesMade, state.status, clearSelection])

  const onToggleHaptics = useCallback(() => {
    setHapticsState(prev => {
      const v = !prev
      setHaptics(v)
      return v
    })
  }, [])

  const onResume = useCallback(() => {
    if (resumePrompt === null) return
    hydrateFrom(resumePrompt.save)
    setResumePrompt(null)
  }, [resumePrompt, hydrateFrom])

  const onDiscardSave = useCallback(() => {
    if (resumePrompt === null) return
    clearSave(resumePrompt.mode)
    setResumePrompt(null)
    setSeed(randomSeed())
    setGameKey(k => k + 1)
  }, [resumePrompt])

  const draggingPiece = draggingIndex !== null ? (state.tray[draggingIndex] ?? null) : null
  const selectedPiece = selectedIndex !== null ? (state.tray[selectedIndex] ?? null) : null
  const activePiece = draggingPiece ?? selectedPiece
  const ghostPiece = useMemo(
    () => (ghost !== null && activePiece !== null ? { cells: activePiece.cells, id: activePiece.id } : null),
    [ghost !== null, activePiece]
  )

  const cfg = MODES[mode]

  return (
    <section id='block-blast' class='block-blast-page'>
      <h1>blockblast <span class='bb-beta-pill'>beta</span></h1>

      <p id='bb-keyboard-hint' class='bb-live'>
        pieces are placed by dragging or by tapping a piece then tapping a grid cell. keyboard placement is not supported in this version.
      </p>

      <div class='bb-live' aria-live='polite' aria-atomic='true'>
        {state.lastCleared !== null
          ? `cleared ${state.lastCleared.rows.length + state.lastCleared.cols.length} lines, score ${state.score}`
          : ''}
      </div>

      <BlockBlastModeTabs current={mode} onChange={onModeChange} />

      {resumePrompt !== null && (
        <div class='bb-resume-prompt'>
          <p>found a saved {resumePrompt.mode} run (score {resumePrompt.save.score}, moves {resumePrompt.save.movesMade}). resume?</p>
          <div class='bb-resume-actions'>
            <button class='cool-button' onClick={onResume}>resume</button>
            <button class='cool-button' onClick={onDiscardSave}>new game</button>
          </div>
        </div>
      )}

      <div class='bb-meta'>
        <span>score: <b>{state.score}</b></span>
        <span class='text-half-visible'>moves: {state.movesMade}{cfg.maxMoves !== null ? ` / ${cfg.maxMoves}` : ''}</span>
        {state.streak > 0 && <span>streak: <b>{state.streak}</b></span>}
      </div>

      {resumePrompt !== null ? null : (
        <>
          <div ref={boardRef} class='bb-board-wrap'>
            <div class='bb-board-stack'>
              <BlockBlastBoard
                board={state.board}
                cellSize={cellSize}
                ghost={ghost}
                ghostPiece={ghostPiece}
                cellPieceIds={state.cellPieceIds}
                clearing={state.lastCleared}
                lastPlacedCells={state.lastPlacedCells}
                selected={selectedIndex !== null}
                onPointerDown={selectedIndex !== null ? boardTap : undefined}
                onPointerMove={selectedIndex !== null ? boardHover : undefined}
                onPointerLeave={selectedIndex !== null ? boardLeave : undefined}
              />
              {state.status === 'game-over' && (
                <BlockBlastGameOver score={state.score} onRetry={onRetry} />
              )}
            </div>
          </div>

          <BlockBlastTray tray={state.tray} trayCellSize={trayCellSize} draggingIndex={draggingIndex} selectedIndex={selectedIndex} onPointerDown={onPieceDown} />
        </>
      )}

      <BlockBlastAchievements unlocks={unlocks} haptics={haptics} onToggleHaptics={onToggleHaptics} />

      <BlockBlastDragLayer
        piece={draggingIndex !== null ? (state.tray[draggingIndex] ?? null) : null}
        pointerX={pointerPos?.x ?? null}
        pointerY={pointerPos?.y ?? null}
        cellSize={cellSize}
        pointerType={pointerType}
      />
    </section>
  )
}
