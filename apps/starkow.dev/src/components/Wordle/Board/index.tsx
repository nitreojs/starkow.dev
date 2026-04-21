import { FC, useLayoutEffect, useMemo, useRef, useState } from 'preact/compat'

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
  showPlaceholders?: boolean
}

export const Board: FC<BoardProps> = ({ length, rows, draft, errorAt, status, hideLetters = false, gameId = null, showPlaceholders = false }) => {
  const [revealIndex, setRevealIndex] = useState<number | null>(null)
  // rows whose flip reveal has finished — placeholders only draw from these so
  // newly-revealed greens don't pop in before the animation completes
  const [committedRows, setCommittedRows] = useState<number>(0)
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
      setCommittedRows(rows.length)

      return
    }

    if (rows.length > rowsLenRef.current) {
      const nextLen = rows.length

      setRevealIndex(nextLen - 1)

      const id = window.setTimeout(() => {
        setRevealIndex(null)
        setCommittedRows(nextLen)
      }, length * 120 + 600)

      rowsLenRef.current = nextLen

      return () => window.clearTimeout(id)
    }

    rowsLenRef.current = rows.length
  }, [rows.length, length, gameId])

  const activeIndex = status === 'playing' ? rows.length : -1
  const activeErrorAt = errorAt !== null && status === 'playing' ? errorAt : null

  const knownGreens = useMemo<(string | null)[]>(() => {
    if (!showPlaceholders) {
      return []
    }

    const result: (string | null)[] = Array.from({ length }, () => null)

    for (let r = 0; r < committedRows; r++) {
      const row = rows[r]

      if (row === undefined) {
        continue
      }

      for (let i = 0; i < length; i++) {
        if (row.mask[i] === 'green') {
          result[i] = row.guess[i] ?? null
        }
      }
    }

    return result
  }, [rows, length, showPlaceholders, committedRows])

  const activeKnownGreens = showPlaceholders && revealIndex === null
    ? knownGreens
    : undefined

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
              knownGreens={activeKnownGreens}
            />
          )
        }

        return <Row key={i} length={length} />
      })}
    </div>
  )
}
