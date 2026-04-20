import type { Cell, Mask } from './types'

// two-pass wordle evaluation:
//   1) mark greens, build a pool of remaining answer letters
//   2) mark yellows by drawing from the pool; else gray
export const evaluateGuess = (guess: string, answer: string): Mask => {
  if (guess.length !== answer.length) {
    throw new Error(`guess/answer length mismatch: ${guess.length} vs ${answer.length}`)
  }

  const n = guess.length
  const mask: Cell[] = new Array(n).fill('gray')
  const pool = new Map<string, number>()

  for (let i = 0; i < n; i++) {
    const g = guess[i]
    const a = answer[i]

    if (g === undefined || a === undefined) continue

    if (g === a) {
      mask[i] = 'green'
    } else {
      pool.set(a, (pool.get(a) ?? 0) + 1)
    }
  }

  for (let i = 0; i < n; i++) {
    if (mask[i] === 'green') continue

    const g = guess[i]

    if (g === undefined) continue

    const remaining = pool.get(g) ?? 0

    if (remaining > 0) {
      mask[i] = 'yellow'
      pool.set(g, remaining - 1)
    }
  }

  return mask
}
