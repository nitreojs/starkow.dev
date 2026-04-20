import { FC, useMemo } from 'preact/compat'

import { LANGS, LENGTHS, type Lang, type Length } from '@starkow.dev/wordle-engine'
import type { DailyPlayedEntry, DailyStatus } from '@starkow.dev/hooks'

interface Props {
  status: DailyStatus
  currentIndex: number
  currentLang: Lang
  currentLength: Length
  onSelect: (index: number) => void
  onClose: () => void
}

const LANG_SHORT: Record<Lang, string> = { en: 'en', ru: 'ru' }

const statusGlyph = (s: DailyPlayedEntry['status'] | 'unplayed'): string => {
  if (s === 'won') return '✓'
  if (s === 'lost') return '✕'
  if (s === 'playing') return '…'
  return '·'
}

const statusClass = (s: DailyPlayedEntry['status'] | 'unplayed'): string => {
  if (s === 'won') return 'wdl-picker-badge-won'
  if (s === 'lost') return 'wdl-picker-badge-lost'
  if (s === 'playing') return 'wdl-picker-badge-playing'
  return 'wdl-picker-badge-unplayed'
}

export const DailyPicker: FC<Props> = ({ status, currentIndex, currentLang, currentLength, onSelect, onClose }) => {
  // newest first, then index descending
  const rows = useMemo(() => {
    const out: { index: number, date: string }[] = []

    for (let i = status.latestIndex; i >= 1; i--) {
      const t = new Date(`${status.epoch}T00:00:00Z`).getTime() + (i - 1) * 24 * 60 * 60 * 1000
      out.push({ index: i, date: new Date(t).toISOString().slice(0, 10) })
    }

    return out
  }, [status.epoch, status.latestIndex])

  const byKey = useMemo(() => {
    const m = new Map<string, DailyPlayedEntry>()

    for (const p of status.played) m.set(`${p.index}:${p.lang}:${p.length}`, p)

    return m
  }, [status.played])

  return (
    <div class='wdl-modal-backdrop' onClick={onClose}>
      <div class='wdl-modal wdl-modal-picker' onClick={e => e.stopPropagation()}>
        <div class='wdl-modal-header'>
          <h2>past dailies</h2>
          <button
            class='wdl-modal-close'
            type='button'
            aria-label='close'
            onClick={onClose}
          >×</button>
        </div>

        <p class='text-small text-half-visible'>
          any past daily stays playable forever. replaying a daily you already finished
          won't affect your stats.
        </p>

        <ul class='wdl-picker-list'>
          {rows.map(({ index, date }) => {
            const isCurrent = index === currentIndex

            return (
              <li
                key={index}
                class={`wdl-picker-row${isCurrent ? ' wdl-picker-row-current' : ''}`}
              >
                <button
                  class='wdl-picker-row-main'
                  type='button'
                  onClick={() => onSelect(index)}
                >
                  <span class='wdl-picker-row-id'>
                    #{index}
                    {index === status.latestIndex && (
                      <span class='wdl-picker-row-today'>today</span>
                    )}
                  </span>
                  <span class='wdl-picker-row-date'>{date}</span>
                </button>

                <div class='wdl-picker-row-badges'>
                  {LANGS.flatMap(l => LENGTHS.map(n => {
                    const entry = byKey.get(`${index}:${l}:${n}`)
                    const s = entry?.status ?? 'unplayed'
                    const isHere = l === currentLang && n === currentLength

                    return (
                      <span
                        key={`${l}:${n}`}
                        class={`wdl-picker-badge ${statusClass(s)}${isHere ? ' wdl-picker-badge-here' : ''}`}
                        title={`${LANG_SHORT[l]} · ${n} letters · ${s}`}
                      >
                        {LANG_SHORT[l]}{n}{statusGlyph(s)}
                      </span>
                    )
                  }))}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
