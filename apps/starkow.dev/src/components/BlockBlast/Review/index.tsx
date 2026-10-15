import { FC, memo, useMemo, useState } from 'preact/compat'
import clsx from 'clsx'

import { analyzeRun, type Mistake, type ModeId, type Move } from '@starkow.dev/block-blast-engine'

interface BlockBlastReviewProps {
  seed: number
  mode: ModeId
  moves: readonly Move[]
}

const describe = (m: Mistake): string => {
  const gain = m.missedLines === 1 ? 'a line' : `${m.missedLines} lines`
  const sealed = `this sealed ${m.extraSealedCells} ${m.extraSealedCells === 1 ? 'cell' : 'cells'}`

  const body = m.extraSealedCells === 0
    ? `here it would clear ${gain}`
    : m.missedLines === 0
      ? `${sealed} — here it stays open`
      : `${sealed} — here it would clear ${gain}`

  return `move ${m.moveIndex + 1} · ${body}${m.comboLost ? ' · and it cost you the combo' : ''}`
}

const MiniBoard: FC<{ mistake: Mistake }> = ({ mistake: { board, piece, played, better } }) => {
  const marks = Array.from(board.cells, (): string[] => [])
  for (const [dr, dc] of piece.cells) {
    marks[(played.r + dr) * board.size + played.c + dc]!.push('bb-mini-cell-played')
    marks[(better.r + dr) * board.size + better.c + dc]!.push('bb-mini-cell-better')
  }

  return (
    <div class='bb-mini-board' style={{ gridTemplateColumns: `repeat(${board.size}, 1fr)` }} aria-hidden='true'>
      {Array.from(board.cells, (v, i) => (
        <span key={i} class={clsx('bb-mini-cell', v !== 0 && 'bb-mini-cell-filled', marks[i])} />
      ))}
    </div>
  )
}

export const BlockBlastReview: FC<BlockBlastReviewProps> = memo(({ seed, mode, moves }) => {
  const [open, setOpen] = useState<boolean>(false)
  const mistakes = useMemo(() => open ? analyzeRun({ seed, mode, moves }) : null, [open, seed, mode, moves])

  return (
    <details class='bb-review' onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>review your game</summary>
      {mistakes !== null && mistakes.length === 0 && (
        <p class='bb-review-clean'>no real mistakes found — that was a clean game.</p>
      )}
      {mistakes !== null && mistakes.length > 0 && (
        <>
          <p class='bb-review-legend text-half-visible'>
            <span class='bb-review-key bb-mini-cell-played' /> your move
            <span class='bb-review-key bb-mini-cell-better' /> a better spot
          </p>
          <ul class='bb-review-list'>
            {mistakes.map(m => (
              <li key={m.moveIndex} class='bb-review-card'>
                <MiniBoard mistake={m} />
                <p>{describe(m)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </details>
  )
})
