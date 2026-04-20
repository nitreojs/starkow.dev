import { FC, useEffect, useState } from 'preact/compat'

import type { Lang, Length, Mode, Row } from '@starkow.dev/wordle-engine'

import { ShareButton } from '../ShareButton'

interface Props {
  won: boolean
  answer: string
  mode: Mode
  lang: Lang
  length: Length
  rows: Row[]
  date: string
  nextResetAt: string | null
  onPlayAgain: () => void
  onStats: () => void
  onClose: () => void
}

const formatRemaining = (target: string): string => {
  const diff = new Date(target).getTime() - Date.now()

  if (!Number.isFinite(diff) || diff <= 0) return 'any moment now'

  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  const pad = (n: number): string => n.toString().padStart(2, '0')

  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`
}

const formatLocalTime = (target: string): string => {
  try {
    return new Date(target).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const useCountdown = (target: string | null): string | null => {
  const [value, setValue] = useState<string | null>(() => target !== null ? formatRemaining(target) : null)

  useEffect(() => {
    if (target === null) {
      setValue(null)
      return
    }

    setValue(formatRemaining(target))

    const id = window.setInterval(() => setValue(formatRemaining(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  return value
}

const wiktionaryUrl = (lang: Lang, word: string): string =>
  `https://${lang}.wiktionary.org/wiki/${encodeURIComponent(word)}`

export const GameOver: FC<Props> = ({ won, answer, mode, lang, length, rows, date, nextResetAt, onPlayAgain, onStats, onClose }) => {
  const remaining = useCountdown(mode === 'daily' ? nextResetAt : null)

  return (
    <div class='wdl-game-over'>
      <button class='wdl-game-over-close' type='button' aria-label='close' onClick={onClose}>×</button>
      <p>{won ? 'you got it!' : 'better luck next time.'}</p>
      <p class='text-large'>
        <a
          class='wdl-answer-link'
          href={wiktionaryUrl(lang, answer)}
          target='_blank'
          rel='noopener noreferrer'
          title='look it up on wiktionary'
        >
          {answer.toUpperCase()}
        </a>
      </p>
      <div class='wdl-game-over-actions'>
        <ShareButton mode={mode} lang={lang} length={length} rows={rows} won={won} date={date} />
        <button class='cool-button' onClick={onStats}>stats</button>
        {mode === 'infinite' && <button class='cool-button' onClick={onPlayAgain}>play again</button>}
      </div>
      {mode === 'daily' && remaining !== null && nextResetAt !== null && (
        <p class='text-small text-half-visible'>
          next game in {remaining}
          <span class='wdl-countdown-local'> (at {formatLocalTime(nextResetAt)} your time)</span>
        </p>
      )}
    </div>
  )
}
