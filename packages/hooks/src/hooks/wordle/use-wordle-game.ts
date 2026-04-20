import { useCallback, useEffect, useRef, useState } from 'preact/compat'

import { ATTEMPTS, type Cell, type Lang, type Length, type Mode, type Row } from '@starkow.dev/wordle-engine'

import { createGame, fetchGame, submitGuess } from './api'
import { getInfiniteGameId, setInfiniteGameId } from './persistence'
import type { GameView, UiStatus } from './types'

type GameError = { kind: 'not-in-dict' | 'wrong-length'; at: number }

// "best so far" per letter: green > yellow > gray
const rank: Record<Cell, number> = { gray: 0, yellow: 1, green: 2 }

const foldKeyState = (rows: Row[]): Record<string, Cell> => {
  const map: Record<string, Cell> = {}

  for (const row of rows) {
    for (let i = 0; i < row.guess.length; i++) {
      const letter = row.guess[i]
      const cell = row.mask[i]

      if (letter === undefined || cell === undefined) continue

      const prev = map[letter]
      if (prev === undefined || rank[cell] > rank[prev]) {
        map[letter] = cell
      }
    }
  }

  return map
}

export interface UseWordleGameOptions {
  dailyIndex?: number
  replay?: boolean
}

export interface UseWordleGame {
  gameId: string | null
  rows: Row[]
  draft: string
  status: UiStatus
  answer: string | null
  nextResetAt: string | null
  dailyIndex: number | null
  dailyDate: string | null
  replay: boolean
  keyState: Record<string, Cell>
  error: GameError | null
  length: Length
  lang: Lang
  mode: Mode
  attempts: number
  typeLetter: (letter: string) => void
  backspace: () => void
  submit: () => Promise<void>
  startNew: () => Promise<void>
}

export const useWordleGame = (
  mode: Mode,
  lang: Lang,
  length: Length,
  options: UseWordleGameOptions = {}
): UseWordleGame => {
  const [game, setGame] = useState<GameView | null>(null)
  const [draft, setDraft] = useState<string>('')
  const [error, setError] = useState<GameError | null>(null)
  const [status, setStatus] = useState<UiStatus>('loading')
  const pending = useRef<boolean>(false)

  const { dailyIndex, replay } = options

  const reset = useCallback(async () => {
    setStatus('loading')
    setDraft('')
    setError(null)

    if (mode === 'infinite') {
      const saved = getInfiniteGameId()

      if (saved !== null) {
        const resumed = await fetchGame(saved).catch(() => null)

        if (resumed !== null && resumed.mode === 'infinite' && resumed.lang === lang && resumed.length === length && resumed.status === 'playing') {
          setGame(resumed)
          setStatus(resumed.status)
          return
        }
      }
    }

    const fresh = await createGame(mode, lang, length, { dailyIndex, replay })

    if (mode === 'infinite') setInfiniteGameId(fresh.gameId)

    setGame(fresh)
    setStatus(fresh.status)
  }, [mode, lang, length, dailyIndex, replay])

  useEffect(() => {
    void reset()
  }, [reset])

  const typeLetter = useCallback((letter: string) => {
    if (status !== 'playing') return
    setError(null)
    setDraft(prev => prev.length >= length ? prev : prev + letter)
  }, [length, status])

  const backspace = useCallback(() => {
    if (status !== 'playing') return
    setError(null)
    setDraft(prev => prev.slice(0, -1))
  }, [status])

  const submit = useCallback(async () => {
    if (game === null) return
    if (status !== 'playing') return
    if (pending.current) return

    if (draft.length !== length) {
      setError({ kind: 'wrong-length', at: Date.now() })
      return
    }

    pending.current = true

    try {
      const res = await submitGuess(game.gameId, draft)

      if (!res.valid) {
        if (res.reason === 'not-in-dictionary') {
          setError({ kind: 'not-in-dict', at: Date.now() })
        } else if (res.reason === 'wrong-length') {
          setError({ kind: 'wrong-length', at: Date.now() })
        }
        return
      }

      setGame(prev => prev === null ? prev : ({
        ...prev,
        rows: [...prev.rows, { guess: draft, mask: res.mask }],
        status: res.status,
        answer: res.answer
      }))
      setStatus(res.status)
      setDraft('')

      if (res.status !== 'playing' && mode === 'infinite') {
        setInfiniteGameId(null)
      }
    } finally {
      pending.current = false
    }
  }, [draft, game, length, mode, status])

  const startNew = useCallback(async () => {
    if (mode === 'infinite') setInfiniteGameId(null)
    await reset()
  }, [mode, reset])

  return {
    gameId: game?.gameId ?? null,
    rows: game?.rows ?? [],
    draft,
    status,
    answer: game?.answer ?? null,
    nextResetAt: game?.nextResetAt ?? null,
    dailyIndex: game?.dailyIndex ?? null,
    dailyDate: game?.dailyDate ?? null,
    replay: game?.replay ?? false,
    keyState: foldKeyState(game?.rows ?? []),
    error,
    length,
    lang,
    mode,
    attempts: ATTEMPTS,
    typeLetter,
    backspace,
    submit,
    startNew
  }
}
