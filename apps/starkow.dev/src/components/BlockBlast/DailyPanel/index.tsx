import { FC, useState } from 'preact/compat'

import { encodeMoves, type Move } from '@starkow.dev/block-blast-engine'
import {
  getNickname,
  setNickname,
  submitDaily,
  type DailySubmitError,
  type DailySubmitOk
} from '@starkow.dev/hooks'

import { BlockBlastLeaderboard } from '../Leaderboard'

interface BlockBlastDailyPanelProps {
  date: string
  attemptId: string | null
  moves: readonly Move[]
  result: DailySubmitOk | null
  onSubmitted: (result: DailySubmitOk) => void
}

const NICKNAME_RE = /^[\p{L}\p{N} ._-]{2,16}$/u

const ERRORS: Record<DailySubmitError, string> = {
  'invalid-nickname': "that nickname isn't allowed — try another one",
  'invalid-run': "the server couldn't verify this run",
  'invalid-moves': "the server couldn't read this run",
  'not-found': 'this ranked attempt has expired — reload to get a new one',
  'already-submitted': 'this run was already submitted',
  unavailable: "couldn't reach the server — try again"
}

export const BlockBlastDailyPanel: FC<BlockBlastDailyPanelProps> = ({ date, attemptId, moves, result, onSubmitted }) => {
  const [nickname, setNicknameInput] = useState<string>(getNickname)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  const trimmed = nickname.trim()
  const nicknameValid = NICKNAME_RE.test(trimmed)

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    if (attemptId === null || !nicknameValid || submitting) return

    setSubmitting(true)
    setError(null)
    const res = await submitDaily(attemptId, trimmed, encodeMoves(moves, 8))
    setSubmitting(false)

    if (!res.ok) {
      setError(ERRORS[res.error])
      return
    }

    setNickname(trimmed)
    onSubmitted(res)
  }

  const onShare = async () => {
    if (result === null) return
    const text = `starkow.dev/blockblast daily ${date} · ${result.entry.score.toLocaleString('en-US')} pts · combo ×${result.entry.maxCombo} · #${result.rank} of ${result.total}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div class='bb-daily-panel'>
      {result !== null && (
        <div class='bb-daily-result'>
          <p>you placed <b>#{result.rank}</b> of {result.total} today.</p>
          <button class='cool-button' onClick={() => { void onShare() }}>{copied ? 'copied!' : 'share'}</button>
        </div>
      )}

      {result === null && attemptId !== null && (
        <form class='bb-daily-form' onSubmit={(e) => { void onSubmit(e) }}>
          <label for='bb-nickname'>submit your ranked run</label>
          <div class='bb-daily-form-row'>
            <input
              id='bb-nickname'
              class='bb-input'
              type='text'
              maxLength={16}
              autoComplete='nickname'
              placeholder='nickname'
              value={nickname}
              onInput={(e) => setNicknameInput((e.currentTarget as HTMLInputElement).value)}
            />
            <button class='cool-button' type='submit' disabled={!nicknameValid || submitting}>
              {submitting ? 'submitting…' : 'submit'}
            </button>
          </div>
          {!nicknameValid && trimmed.length > 0 && (
            <p class='bb-daily-hint text-half-visible'>2–16 letters, digits, spaces or . _ -</p>
          )}
          {error !== null && <p class='bb-daily-error'>{error}</p>}
        </form>
      )}

      {result === null && attemptId === null && (
        <p class='text-half-visible'>practice run — only your first run of the day is ranked.</p>
      )}

      <BlockBlastLeaderboard key={result?.entry.id ?? 'pending'} date={date} />
    </div>
  )
}
