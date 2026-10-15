import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'preact/compat'

import { analyzeRun, MODES, type ModeId } from '@starkow.dev/block-blast-engine'
import {
  clearSave,
  getHaptics,
  getSave,
  recordDailySubmission,
  setHaptics,
  serializeBlockBlastGame,
  useBlockBlastAchievements,
  useBlockBlastDaily,
  useBlockBlastDrag,
  useBlockBlastGame,
  useTitleSuffix,
  writeSave,
  type DailySubmitOk,
  type HoldTarget,
  type ResumableSave,
  type TrayIndex
} from '@starkow.dev/hooks'

import {
  BlockBlastAchievements,
  BlockBlastBoard,
  BlockBlastComboMeter,
  BlockBlastDailyBar,
  BlockBlastDailyPanel,
  BlockBlastDragLayer,
  BlockBlastGameOver,
  BlockBlastHoldSlot,
  BlockBlastModeTabs,
  BlockBlastReview,
  BlockBlastScorePopup,
  BlockBlastTray,
  TRAY_SLOT_CELLS
} from '../../components'

import './style.css'

const SAVE_DEBOUNCE_MS = 500
const randomSeed = () => Math.floor(Math.random() * 0xffffffff) >>> 0
const HOLD_CHROME_PX = 24

const computeCellSize = (boardSize: number): number => {
  if (typeof window === 'undefined') return 44
  const available = Math.min(window.innerWidth - 64, 820)
  const raw = Math.floor(available / boardSize)
  return Math.max(28, Math.min(56, raw))
}

// tray cell size: shrink past 0.7×boardCell to keep 3 slots + tray padding/gaps within viewport width
const computeTrayCellSize = (boardCellSize: number, withHold: boolean): number => {
  const ideal = boardCellSize * 0.7
  if (typeof window === 'undefined') return ideal
  // tray css: padding 0.5em + 2 gaps of 0.5em ≈ 32px of non-slot width
  // also subtract a small page-margin allowance so the tray never kisses the viewport edge
  const slotsBudget = window.innerWidth - 32 - 16 - (withHold ? HOLD_CHROME_PX : 0)
  const maxByViewport = slotsBudget / ((withHold ? 4 : 3) * TRAY_SLOT_CELLS)
  return Math.max(14, Math.floor(Math.min(ideal, maxByViewport)))
}

export const BlockBlastPage: FC = () => {
  useTitleSuffix('blockblast')

  const [mode, setMode] = useState<ModeId>('classic')
  const [seed, setSeed] = useState<number>(randomSeed)
  const [gameKey, setGameKey] = useState<number>(0)

  const [haptics, setHapticsState] = useState<boolean>(getHaptics())

  const [resumePrompt, setResumePrompt] = useState<{ mode: ModeId, save: ResumableSave } | null>(null)
  const [dailyOutcome, setDailyOutcome] = useState<DailySubmitOk | 'skipped' | null>(null)

  const daily = useBlockBlastDaily(mode === 'daily')
  const dailySession = daily.session
  const dailyRanked = dailySession?.ranked === true && dailyOutcome === null
  const dailyDate = dailySession?.date ?? null

  const boardRef = useRef<HTMLDivElement | null>(null)
  const getBoardRect = useCallback(() => {
    const inner = boardRef.current?.querySelector('.bb-board')
    return inner?.getBoundingClientRect() ?? null
  }, [])
  const holdSlotRef = useRef<HTMLButtonElement | null>(null)

  const { state, place, hold, reset, hydrateFrom } = useBlockBlastGame({ mode, seed })
  const { game } = state
  const holdEnabled = MODES[game.mode].hold

  const [cellSize, setCellSize] = useState<number>(() => computeCellSize(MODES[mode].boardSize))
  const [trayCellSize, setTrayCellSize] = useState<number>(() => computeTrayCellSize(computeCellSize(MODES[mode].boardSize), false))
  useEffect(() => {
    const recompute = () => {
      const next = computeCellSize(game.board.size)
      setCellSize(next)
      setTrayCellSize(computeTrayCellSize(next, holdEnabled))
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [game.board.size, holdEnabled])

  useEffect(() => {
    if (mode === 'daily') return
    reset(mode, seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seed, gameKey])

  useEffect(() => {
    if (dailySession === null) return
    setDailyOutcome(null)
    const save = getSave('daily')
    if (save !== null && save.seed === dailySession.seed && save.date === dailySession.date && (dailySession.ranked || !save.snapshot.over)) {
      hydrateFrom(save)
      return
    }
    clearSave('daily')
    reset('daily', dailySession.seed)
  }, [dailySession, hydrateFrom, reset])

  useEffect(() => {
    if (!MODES[mode].resumable || mode === 'daily') {
      setResumePrompt(null)
      return
    }
    const save = getSave(mode)
    setResumePrompt(save !== null && save.moveHistory.length > 0 ? { mode, save } : null)
  }, [mode])

  const saveTimerRef = useRef<number | null>(null)
  useEffect(() => {
    if (!MODES[mode].resumable || game.mode !== mode || state.moveHistory.length === 0) return
    if (game.over && !dailyRanked) {
      clearSave(mode)
      return
    }

    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      writeSave(mode, serializeBlockBlastGame(state, mode === 'daily' ? dailyDate : null))
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    }
  }, [state, game, mode, dailyRanked, dailyDate])

  const holdTarget = useMemo<HoldTarget | null>(() => holdEnabled
    ? { getRect: () => holdSlotRef.current?.getBoundingClientRect() ?? null, onHold: hold }
    : null, [holdEnabled, hold])

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
    clearSelection,
    holdHover
  } = useBlockBlastDrag(game.board, cellSize, getBoardRect, place, game.tray, holdTarget)
  const { unlocks, tryUnlock } = useBlockBlastAchievements()

  const lastMovesRef = useRef(0)
  useEffect(() => {
    const moves = state.moveHistory.length
    if (moves === lastMovesRef.current) return
    lastMovesRef.current = moves

    if (game.placements === 1) tryUnlock('first-placement')
    if (state.lastCleared !== null) {
      const lines = state.lastCleared.rows.length + state.lastCleared.cols.length
      if (lines >= 1) tryUnlock('first-line-clear')
      if (lines === 2) tryUnlock('double-line-clear')
      if (lines >= 3) tryUnlock('triple-line-clear')
      if (lines >= 4) tryUnlock('quad-clear')
      if (haptics && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(10)
      }
    }
    if (state.lastScoreEvent?.boardCleared === true) tryUnlock('board-clear')
    if (game.boardClears >= 3) tryUnlock('board-clear-3')
    if (game.score >= 1000) tryUnlock('reach-1k')
    if (game.score >= 5000) tryUnlock('reach-5k')
    if (game.score >= 10000) tryUnlock('reach-10k')
    if (game.mode === 'hold' && game.score >= 5000) tryUnlock('hold-5k')
    if (game.placements >= 100) tryUnlock('survive-100')
    if (game.placements >= 200) tryUnlock('survive-200')
    if (game.combo >= 10) tryUnlock('streak-5')
    if (game.combo >= 20) tryUnlock('streak-10')
    if (game.combo >= 30) tryUnlock('combo-30')

    const anyBigSquare = state.cellPieceIds.some(id => id === '3x3')
    if (anyBigSquare) tryUnlock('place-3x3')
  }, [state, game, haptics, tryUnlock])

  useEffect(() => {
    if (!game.over || game.placements < 100 || unlocks['clean-run'] !== undefined) return
    if (analyzeRun({ seed: state.seed, mode: game.mode, moves: state.moveHistory }).length === 0) tryUnlock('clean-run')
  }, [game.over, game.placements, game.mode, state.seed, state.moveHistory, unlocks, tryUnlock])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('achievement') !== 'terminal') return
    tryUnlock('terminal')
    params.delete('achievement')
    const query = params.toString()
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query === '' ? '' : `?${query}`}${window.location.hash}`)
  }, [tryUnlock])

  const onPieceDown = useCallback((index: TrayIndex, e: PointerEvent) => {
    const piece = game.tray[index]
    if (piece === null || piece === undefined) return
    start(piece, index, e)
  }, [game.tray, start])

  const onHoldTap = useCallback(() => {
    if (selectedIndex === null) return
    hold(selectedIndex)
    clearSelection()
  }, [selectedIndex, hold, clearSelection])

  const onRetry = useCallback(() => {
    clearSelection()
    if (mode === 'daily') {
      if (dailySession === null) return
      if (dailyRanked) {
        if (!window.confirm('skip submitting this ranked run? only your first daily run counts.')) return
        setDailyOutcome('skipped')
      }
      clearSave('daily')
      reset('daily', dailySession.seed)
      return
    }
    if (MODES[mode].resumable) clearSave(mode)
    setSeed(randomSeed())
    setGameKey(k => k + 1)
  }, [mode, dailySession, dailyRanked, reset, clearSelection])

  const onDailySubmitted = useCallback((result: DailySubmitOk) => {
    setDailyOutcome(result)
    tryUnlock('daily-first')
    if (dailyDate !== null) {
      const streak = recordDailySubmission(dailyDate)
      if (streak >= 3) tryUnlock('daily-streak-3')
      if (streak >= 7) tryUnlock('daily-streak-7')
    }
    if (result.rank <= 10) tryUnlock('daily-top-10')
  }, [dailyDate, tryUnlock])

  const onModeChange = useCallback((m: ModeId) => {
    if (m === mode) return

    const isMidRun = state.moveHistory.length > 0
      && !game.over
      && MODES[mode].resumable
      && mode !== 'daily'

    if (isMidRun) {
      const ok = window.confirm(`abandon current ${mode} run?`)
      if (!ok) return
      clearSave(mode)
    }
    clearSelection()
    setMode(m)
    setSeed(randomSeed())
  }, [mode, state.moveHistory.length, game.over, clearSelection])

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

  const draggingPiece = draggingIndex !== null ? (game.tray[draggingIndex] ?? null) : null
  const selectedPiece = selectedIndex !== null ? (game.tray[selectedIndex] ?? null) : null
  const activePiece = draggingPiece ?? selectedPiece
  const ghostPiece = useMemo(
    () => (ghost !== null && activePiece !== null ? { cells: activePiece.cells, id: activePiece.id } : null),
    [ghost !== null, activePiece]
  )

  const cfg = MODES[mode]
  const showGame = resumePrompt === null && (mode !== 'daily' || (daily.status === 'ready' && game.mode === 'daily'))

  return (
    <section id='block-blast' class='block-blast-page'>
      <h1>blockblast <span class='bb-beta-pill'>beta</span></h1>

      <p id='bb-keyboard-hint' class='bb-live'>
        pieces are placed by dragging or by tapping a piece then tapping a grid cell. keyboard placement is not supported in this version.
      </p>

      <div class='bb-live' aria-live='polite' aria-atomic='true'>
        {state.lastCleared !== null
          ? `cleared ${state.lastCleared.rows.length + state.lastCleared.cols.length} lines, score ${game.score}`
          : ''}
      </div>

      <BlockBlastModeTabs current={mode} onChange={onModeChange} />

      {mode === 'daily' && (
        <BlockBlastDailyBar status={daily.status} date={dailyDate} ranked={dailyRanked} onRetry={daily.retry} />
      )}

      {resumePrompt !== null && (
        <div class='bb-resume-prompt'>
          <p>found a saved {resumePrompt.mode} run (score {resumePrompt.save.snapshot.score}, moves {resumePrompt.save.snapshot.placements}). resume?</p>
          <div class='bb-resume-actions'>
            <button class='cool-button' onClick={onResume}>resume</button>
            <button class='cool-button' onClick={onDiscardSave}>new game</button>
          </div>
        </div>
      )}

      {showGame && (
        <>
          <div class='bb-meta'>
            <span>score: <b>{game.score}</b></span>
            <span class='text-half-visible'>moves: {game.placements}{cfg.maxMoves !== null ? ` / ${cfg.maxMoves}` : ''}</span>
            {game.combo > 0 && <BlockBlastComboMeter combo={game.combo} misses={game.comboMisses} />}
          </div>

          <div ref={boardRef} class='bb-board-wrap'>
            <div class='bb-board-stack'>
              <BlockBlastBoard
                board={game.board}
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
              {state.lastScoreEvent !== null && (
                <BlockBlastScorePopup key={state.moveHistory.length} event={state.lastScoreEvent} />
              )}
              {game.over && (
                <BlockBlastGameOver
                  score={game.score}
                  note={dailyRanked ? 'submit your ranked run below' : undefined}
                  onRetry={onRetry}
                />
              )}
            </div>
          </div>

          {game.over && (
            <div class='bb-post-game'>
              {mode === 'daily' && dailySession !== null && (
                <BlockBlastDailyPanel
                  date={dailySession.date}
                  attemptId={dailyRanked ? dailySession.attemptId : null}
                  moves={state.moveHistory}
                  result={dailyOutcome === 'skipped' ? null : dailyOutcome}
                  onSubmitted={onDailySubmitted}
                />
              )}
              {state.moveHistory.length > 0 && (
                <BlockBlastReview
                  key={`${state.seed}-${state.moveHistory.length}`}
                  seed={state.seed}
                  mode={game.mode}
                  moves={state.moveHistory}
                />
              )}
            </div>
          )}

          <div class='bb-tray-row'>
            {holdEnabled && (
              <BlockBlastHoldSlot
                piece={game.held}
                trayCellSize={trayCellSize}
                armed={selectedIndex !== null}
                hover={holdHover}
                slotRef={holdSlotRef}
                onTap={onHoldTap}
              />
            )}
            <BlockBlastTray tray={game.tray} trayCellSize={trayCellSize} draggingIndex={draggingIndex} selectedIndex={selectedIndex} onPointerDown={onPieceDown} />
          </div>
        </>
      )}

      <BlockBlastAchievements unlocks={unlocks} haptics={haptics} onToggleHaptics={onToggleHaptics} />

      <BlockBlastDragLayer
        piece={draggingPiece}
        pointerX={pointerPos?.x ?? null}
        pointerY={pointerPos?.y ?? null}
        cellSize={cellSize}
        pointerType={pointerType}
      />
    </section>
  )
}
