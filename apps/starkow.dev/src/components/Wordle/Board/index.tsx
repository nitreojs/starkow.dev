import { FC, useLayoutEffect, useRef, useState } from 'preact/compat'

import { ATTEMPTS, type Row as RowType } from '@starkow.dev/wordle-engine'

import { Row } from '../Row'

interface BoardProps {
  length: number
  rows: RowType[]
  draft: string
  errorAt: number | null
  status: 'playing' | 'won' | 'lost' | 'loading'
  hideLetters?: boolean
  gameId?: string | null
}

export const Board: FC<BoardProps> = ({ length, rows, draft, errorAt, status, hideLetters = false, gameId = null }) => {
  const [revealIndex, setRevealIndex] = useState<number | null>(null)
  const rowsLenRef = useRef<number>(0)
  const gameIdRef = useRef<string | null>(null)

  // useLayoutEffect so revealing=true is applied before first paint of the new row,
  // avoiding a one-frame flash of the final colour.
  useLayoutEffect(() => {
    // new game loaded — sync without triggering reveal, even if rows are pre-populated
    if (gameIdRef.current !== gameId) {
      gameIdRef.current = gameId
      rowsLenRef.current = rows.length
      setRevealIndex(null)
      return
    }

    if (rows.length > rowsLenRef.current) {
      setRevealIndex(rows.length - 1)
      const id = window.setTimeout(() => setRevealIndex(null), length * 120 + 600)
      rowsLenRef.current = rows.length
      return () => window.clearTimeout(id)
    }

    rowsLenRef.current = rows.length
  }, [rows.length, length, gameId])

  const activeIndex = status === 'playing' ? rows.length : -1
  const activeErrorAt = errorAt !== null && status === 'playing' ? errorAt : null

  return (
    <div class='wdl-board'>
      {Array.from({ length: ATTEMPTS }, (_, i) => {
        if (i < rows.length) {
          const r = rows[i]!
          return (
            <Row
              key={i}
              length={length}
              letters={r.guess}
              mask={r.mask}
              revealing={revealIndex === i}
              hideLetters={hideLetters}
            />
          )
        }

        if (i === activeIndex) {
          return (
            <Row
              key={i}
              length={length}
              letters={draft}
              errorAt={activeErrorAt}
              active
              hideLetters={hideLetters}
            />
          )
        }

        return <Row key={i} length={length} />
      })}
    </div>
  )
}
