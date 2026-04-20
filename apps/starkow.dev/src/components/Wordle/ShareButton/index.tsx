import { FC, useState } from 'preact/compat'

import type { Cell, Lang, Length, Mode, Row } from '@starkow.dev/wordle-engine'

interface Props {
  mode: Mode
  lang: Lang
  length: Length
  rows: Row[]
  won: boolean
  date: string
  dailyIndex: number | null
  replay: boolean
}

const CELL: Record<Cell, string> = { green: '🟩', yellow: '🟨', gray: '⬛' }

const buildText = ({ mode, lang, length, rows, won, date, dailyIndex, replay }: Props): string => {
  const scope = mode === 'daily'
    ? dailyIndex !== null
      ? `daily #${dailyIndex}${date === '' ? '' : ` · ${date}`}`
      : `daily · ${date}`
    : 'infinite'

  const replayTag = replay ? ' · replay' : ''
  const score = `${won ? rows.length : 'x'}/6`
  const header = `starkow wordle · ${lang}-${length} · ${scope}${replayTag} · ${score}`
  const grid = rows.map(r => r.mask.map(c => CELL[c]).join('')).join('\n')

  return `${header}\n\n${grid}\n\nplay at https://starkow.dev/wordle`
}

export const ShareButton: FC<Props> = props => {
  const [copied, setCopied] = useState<boolean>(false)

  const onClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(buildText(props))

      setCopied(true)

      window.setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <button class='cool-button' onClick={onClick}>
      {copied ? 'copied!' : 'share'}
    </button>
  )
}
