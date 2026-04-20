import { FC, useState } from 'preact/compat'

import type { Cell, Lang, Length, Mode, Row } from '@starkow.dev/wordle-engine'

interface Props {
  mode: Mode
  lang: Lang
  length: Length
  rows: Row[]
  won: boolean
  date: string
}

const CELL: Record<Cell, string> = { green: '🟩', yellow: '🟨', gray: '⬛' }

const buildText = ({ mode, lang, length, rows, won, date }: Props): string => {
  const header = mode === 'daily'
    ? `starkow wordle · ${lang}-${length} · ${date} · ${won ? rows.length : 'x'}/6`
    : `starkow wordle · ${lang}-${length} · infinite · ${won ? rows.length : 'x'}/6`
  const grid = rows.map(r => r.mask.map(c => CELL[c]).join('')).join('\n')
  return `${header}\n${grid}\n\nplay at https://starkow.dev/wordle`
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
