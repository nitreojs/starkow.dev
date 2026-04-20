import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'preact/compat'
import { useLocation, useRoute } from 'wouter-preact'

import {
  DEFAULT_LANG,
  DEFAULT_LENGTH,
  LANGS,
  LENGTHS,
  type Lang,
  type Length,
  type Mode
} from '@starkow.dev/wordle-engine'
import {
  fetchDailyStatus,
  getLastConfig,
  setLastConfig,
  useWordleGame,
  useWordleKeyboard,
  useWordleStats,
  type DailyStatus
} from '@starkow.dev/hooks'

import {
  Board,
  DailyPicker,
  Dropdown,
  GameOver,
  Keyboard,
  ShareButton,
  StatsModal
} from '../../components'

import './style.css'

const MODE_LABELS: Record<Mode, string> = { daily: 'daily', infinite: 'infinite' }
const LANG_LABELS: Record<Lang, string> = { en: 'english', ru: 'russian' }

const parseIndex = (raw: string | undefined): number | null => {
  if (raw === undefined) return null

  const n = Number(raw)

  if (!Number.isInteger(n) || n < 1) return null

  return n
}

export const WordlePage: FC = () => {
  document.title = 'starkow★dev • wordle'

  const [, navigate] = useLocation()
  const [, dailyRouteParams] = useRoute<{ index?: string }>('/wordle/daily/:index')
  const urlIndex = parseIndex(dailyRouteParams?.index)

  const initial = useMemo(() => getLastConfig(), [])
  // when a /daily/:n route is active we force mode=daily; otherwise use last
  const [mode, setMode] = useState<Mode>(urlIndex !== null ? 'daily' : initial?.mode ?? 'daily')
  const [lang, setLang] = useState<Lang>(initial?.lang ?? DEFAULT_LANG)
  const [length, setLength] = useState<Length>(initial?.length ?? DEFAULT_LENGTH)
  const [replay, setReplay] = useState<boolean>(false)
  const [statsOpen, setStatsOpen] = useState<boolean>(false)
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false)
  const [pickerOpen, setPickerOpen] = useState<boolean>(false)
  const [overlayClosed, setOverlayClosed] = useState<boolean>(true)
  const [hideLetters, setHideLetters] = useState<boolean>(false)
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null)
  const [liveMessage, setLiveMessage] = useState<string>('')
  const [colorblindHints, setColorblindHints] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('wordle:options')
      if (raw === null) return false
      const parsed = JSON.parse(raw) as { colorblindHints?: boolean }
      return parsed.colorblindHints === true
    } catch { return false }
  })

  // if the user lands on /wordle/daily/:n, force daily mode and clear any replay
  useEffect(() => {
    if (urlIndex === null) return
    if (mode !== 'daily') setMode('daily')
    if (replay) setReplay(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlIndex])

  // redirect away from out-of-range /wordle/daily/:n once we know the latest index
  useEffect(() => {
    if (urlIndex === null || dailyStatus === null) return
    if (urlIndex > dailyStatus.latestIndex) navigate('/wordle')
  }, [urlIndex, dailyStatus, navigate])

  useEffect(() => { setLastConfig({ mode, lang, length }) }, [mode, lang, length])

  useEffect(() => {
    try { localStorage.setItem('wordle:options', JSON.stringify({ colorblindHints })) } catch { /* ignore */ }
  }, [colorblindHints])

  // changing lang/length on a past daily is fine — the hook will swap
  // to that daily's answer for the new lang/length combo.
  const dailyIndex = mode === 'daily' && urlIndex !== null ? urlIndex : undefined

  const game = useWordleGame(mode, lang, length, { dailyIndex, replay })
  const { stats, recordGame } = useWordleStats(lang, length)

  useEffect(() => {
    setOverlayClosed(true)
    setHideLetters(false)
  }, [game.gameId])

  const prevStatusRef = useRef<string>('loading')
  useEffect(() => {
    if (prevStatusRef.current === 'playing' && (game.status === 'won' || game.status === 'lost')) {
      setOverlayClosed(false)
    }
    prevStatusRef.current = game.status
  }, [game.status])

  const refreshDailyStatus = useCallback(() => {
    void fetchDailyStatus().then(s => { if (s !== null) setDailyStatus(s) })
  }, [])

  useEffect(() => { refreshDailyStatus() }, [refreshDailyStatus])

  useEffect(() => {
    if (game.status === 'won' || game.status === 'lost') refreshDailyStatus()
  }, [game.status, refreshDailyStatus])

  const lastAnnouncedRowRef = useRef<number>(0)
  useEffect(() => {
    lastAnnouncedRowRef.current = game.rows.length
  }, [game.gameId])

  useEffect(() => {
    if (game.rows.length > lastAnnouncedRowRef.current) {
      const last = game.rows[game.rows.length - 1]
      if (last !== undefined) {
        const parts = last.guess.split('').map((ch, i) => `${ch} ${last.mask[i] ?? 'gray'}`).join(', ')
        const attemptsLeft = game.attempts - game.rows.length
        const tail = game.status === 'won'
          ? `; you won in ${game.rows.length} ${game.rows.length === 1 ? 'guess' : 'guesses'}`
          : game.status === 'lost'
            ? `; out of guesses, the answer was ${game.answer ?? ''}`
            : `; ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`
        setLiveMessage(`row ${game.rows.length}: ${parts}${tail}`)
      }
      lastAnnouncedRowRef.current = game.rows.length
    }
  }, [game.rows, game.attempts, game.status, game.answer])

  useEffect(() => {
    if (game.error === null) return
    if (game.error.kind === 'not-in-dict') setLiveMessage('not in dictionary')
    else if (game.error.kind === 'wrong-length') setLiveMessage(`word must be ${length} letters`)
  }, [game.error, length])

  useWordleKeyboard({
    lang,
    enabled: game.status === 'playing' && !optionsOpen && !statsOpen && !pickerOpen,
    onLetter: game.typeLetter,
    onBackspace: game.backspace,
    onSubmit: () => { void game.submit() }
  })

  // stats record only on first-attempt daily/infinite games; replays are excluded.
  const recordedRef = useRef<string | null>(null)
  const prevForRecordRef = useRef<string>('loading')

  useEffect(() => {
    const prev = prevForRecordRef.current
    prevForRecordRef.current = game.status

    if (prev !== 'playing') return
    if (game.status !== 'won' && game.status !== 'lost') return
    if (game.gameId === null) return
    if (game.rows.length === 0) return
    if (game.replay) return

    const key = `${game.gameId}:${game.status}`
    if (recordedRef.current === key) return
    recordedRef.current = key

    recordGame(game.status === 'won', game.rows.length, mode === 'daily')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.status])

  // decorate lang/length dropdowns with the status of the currently selected daily
  const activeIndex = game.dailyIndex ?? dailyStatus?.latestIndex ?? null
  const dailyHint = (l: Lang, n: Length): string | undefined => {
    if (mode !== 'daily' || dailyStatus === null || activeIndex === null) return undefined

    const entry = dailyStatus.played.find(p => p.index === activeIndex && p.lang === l && p.length === n)

    if (entry === undefined) return undefined
    if (entry.status === 'won') return '✓'
    if (entry.status === 'lost') return '✕'

    return '…'
  }

  const selectDaily = (index: number): void => {
    setPickerOpen(false)
    setReplay(false)

    if (dailyStatus !== null && index === dailyStatus.latestIndex) {
      navigate('/wordle')
      return
    }

    navigate(`/wordle/daily/${index}`)
  }

  const onReplayPastDaily = (): void => {
    setReplay(true)
    setOverlayClosed(true)
    void game.startNew()
  }

  const dailyLabel = game.dailyIndex !== null ? `daily #${game.dailyIndex}` : 'daily'
  const shareDate = mode === 'daily' ? game.dailyDate ?? '' : ''
  const viewingPastDaily = game.dailyIndex !== null && dailyStatus !== null && game.dailyIndex < dailyStatus.latestIndex

  return (
    <section id='wordle' class={`wordle-page${colorblindHints ? ' wdl-cb' : ''}`}>
      <div class='wdl-live' aria-live='polite' aria-atomic='true'>{liveMessage}</div>
      <div class='wdl-header'>
        <h1>wordle <span class='wdl-beta-pill'>beta</span></h1>

        <div class='wdl-header-controls'>
          <Dropdown
            ariaLabel='mode'
            value={mode}
            options={(['daily', 'infinite'] as Mode[]).map(m => ({
              value: m,
              label: m === 'daily' ? dailyLabel : MODE_LABELS[m]
            }))}
            onChange={v => {
              const next = v as Mode
              if (next === mode) return
              setMode(next)
              setReplay(false)
              // leave the archived-daily route when switching to infinite
              if (next === 'infinite' && urlIndex !== null) navigate('/wordle')
            }}
          />

          {mode === 'daily' && (
            <button
              class='cool-button wdl-picker-trigger'
              type='button'
              onClick={() => setPickerOpen(true)}
              title='browse past dailies'
            >past</button>
          )}

          <Dropdown
            ariaLabel='language'
            value={lang}
            options={LANGS.map(l => ({
              value: l,
              label: LANG_LABELS[l],
              hint: dailyHint(l, length)
            }))}
            onChange={v => { if (v !== lang) { setLang(v as Lang); setReplay(false) } }}
          />

          <Dropdown
            ariaLabel='word length'
            value={String(length)}
            options={LENGTHS.map(n => ({
              value: String(n),
              label: `${n} letters`,
              hint: dailyHint(lang, n)
            }))}
            onChange={v => {
              const n = Number(v) as Length
              if (n !== length) { setLength(n); setReplay(false) }
            }}
          />
        </div>
      </div>

      <button
        class='wdl-hamburger'
        type='button'
        aria-label='options'
        onClick={() => setOptionsOpen(true)}
      >
        <svg viewBox='0 0 20 14' width='20' height='14' aria-hidden='true'>
          <rect x='0' y='0'  width='20' height='2' rx='1' fill='currentColor' />
          <rect x='0' y='6'  width='20' height='2' rx='1' fill='currentColor' />
          <rect x='0' y='12' width='20' height='2' rx='1' fill='currentColor' />
        </svg>
      </button>

      <p class='text-small text-half-visible'>
        you won't <i>guess</i> what this game is about
      </p>

      <div class='wdl-stage' key={game.gameId ?? 'empty'}>
        <Board
          length={length}
          rows={game.rows}
          draft={game.draft}
          errorAt={game.error?.at ?? null}
          status={game.status}
          hideLetters={hideLetters}
          gameId={game.gameId}
        />

        {(game.status === 'won' || game.status === 'lost') && game.answer !== null && !overlayClosed && (
          <GameOver
            won={game.status === 'won'}
            answer={game.answer}
            mode={mode}
            lang={lang}
            length={length}
            rows={game.rows}
            date={shareDate}
            dailyIndex={game.dailyIndex}
            replay={game.replay}
            nextResetAt={game.nextResetAt}
            onPlayAgain={() => {
              if (mode === 'daily') onReplayPastDaily()
              else void game.startNew()
            }}
            onStats={() => setStatsOpen(true)}
            onClose={() => setOverlayClosed(true)}
            canReplayDaily={viewingPastDaily}
          />
        )}
      </div>

      <Keyboard
        lang={lang}
        keyState={game.keyState}
        onLetter={game.typeLetter}
        onBackspace={game.backspace}
        onSubmit={() => { void game.submit() }}
        disabled={game.status !== 'playing'}
      />

      <div class='wdl-footer'>
        <button class='cool-button' onClick={() => setStatsOpen(true)}>stats</button>
        {(game.status === 'won' || game.status === 'lost') && (
          <>
            <ShareButton
              mode={mode}
              lang={lang}
              length={length}
              rows={game.rows}
              won={game.status === 'won'}
              date={shareDate}
              dailyIndex={game.dailyIndex}
              replay={game.replay}
            />
            <button class='cool-button' onClick={() => setHideLetters(v => !v)}>
              {hideLetters ? 'show letters' : 'hide letters'}
            </button>
            {mode === 'infinite' && (
              <button class='cool-button' onClick={() => { void game.startNew() }}>
                play again
              </button>
            )}
            {viewingPastDaily && (
              <button class='cool-button' onClick={onReplayPastDaily}>
                replay
              </button>
            )}
          </>
        )}
      </div>

      {pickerOpen && dailyStatus !== null && (
        <DailyPicker
          status={dailyStatus}
          currentIndex={game.dailyIndex ?? dailyStatus.latestIndex}
          currentLang={lang}
          currentLength={length}
          onSelect={selectDaily}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {statsOpen && (
        <StatsModal
          stats={stats}
          highlightRow={game.status === 'won' ? game.rows.length : null}
          onClose={() => setStatsOpen(false)}
        />
      )}

      {optionsOpen && (
        <div class='wdl-modal-backdrop' onClick={() => setOptionsOpen(false)}>
          <div class='wdl-modal wdl-modal-options' onClick={e => e.stopPropagation()}>
            <div class='wdl-modal-header'>
              <h2>options</h2>
              <button
                class='wdl-modal-close'
                type='button'
                aria-label='close'
                onClick={() => setOptionsOpen(false)}
              >×</button>
            </div>
            <label class='wdl-option'>
              <input
                type='checkbox'
                checked={colorblindHints}
                onChange={e => setColorblindHints((e.target as HTMLInputElement).checked)}
              />
              <span>
                colorblind hints
                <br />
                <span class='text-small text-half-visible'>adds diagonal stripes to yellow tiles and keys</span>
              </span>
            </label>

            <div class='wdl-option-danger'>
              <button
                class='cool-button'
                onClick={() => {
                  if (!window.confirm('clear all wordle stats across every language and length?')) return
                  try {
                    for (let i = localStorage.length - 1; i >= 0; i--) {
                      const k = localStorage.key(i)
                      if (k !== null && k.startsWith('wordle:stats:')) localStorage.removeItem(k)
                    }
                  } catch { /* ignore */ }
                  setOptionsOpen(false)
                  window.location.reload()
                }}
              >
                reset stats
              </button>
              <span class='text-small text-half-visible'>clears all languages and lengths; irreversible</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
