import type { Board } from './board'
import { PIECES } from './pieces'
import { createRng, hydrateRng, serializeRng, type Rng, type RngState } from './rng'
import type { GeneratorStrategy, Piece } from './types'

export type GeneratorState = {
  rng: RngState
  // legacy fields kept for backwards-compat with v1 saves; ignored on hydrate
  bag?: readonly string[]
  bagIndex?: number
}

// dynamic context that lets the generator escalate help when the player is struggling
// or amplify reward-pressure when the player is on a streak
export type GenerationContext = {
  // current combo streak (clears in consecutive moves). 0 = none.
  streak?: number
  // number of placements since the last line clear. ramps up as player struggles.
  roundsSinceClear?: number
  // count of "isolated" empty cells the player created in the last N moves
  recentHolesCreated?: number
  // true when the previous placement just emptied the entire board (perfect clear)
  boardJustCleared?: boolean
  // ids of pieces given to the player in the last few trays — used for anti-repeat penalty
  recentPieceIds?: readonly string[]
}

const TOTAL_WEIGHT = PIECES.reduce((s, p) => s + p.weight, 0)

const PERMS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
]

const ORTHO_DIRS: readonly (readonly [number, number])[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export class PieceGenerator {
  private rng: Rng
  readonly strategy: GeneratorStrategy

  constructor (seed: number, strategy: GeneratorStrategy) {
    this.rng = createRng(seed)
    this.strategy = strategy
  }

  static hydrate (state: GeneratorState, strategy: GeneratorStrategy): PieceGenerator {
    const gen = Object.create(PieceGenerator.prototype) as PieceGenerator
    ;(gen as unknown as { rng: Rng }).rng = hydrateRng(state.rng)
    ;(gen as unknown as { strategy: GeneratorStrategy }).strategy = strategy
    return gen
  }

  serialize (): GeneratorState {
    return { rng: serializeRng(this.rng) }
  }

  private weightedDraw (): Piece {
    let r = this.rng.next() * TOTAL_WEIGHT
    for (const p of PIECES) {
      r -= p.weight
      if (r <= 0) return p
    }
    return PIECES[PIECES.length - 1]!
  }

  nextTray (board: Board, ctx?: GenerationContext): readonly [Piece, Piece, Piece] {
    if (this.strategy === 'seeded-bag') {
      return [this.weightedDraw(), this.weightedDraw(), this.weightedDraw()] as const
    }
    return this.nextTraySolvable(board, ctx ?? {})
  }

  // returns guaranteed-fits replacements for the unplaced tray slots — used when player hesitates
  // hesitation rescue pretends nothing happened (deterministic resume): rng advances normally
  rescueUnplaced (
    board: Board,
    currentTray: readonly (Piece | null)[],
    ctx?: GenerationContext
  ): readonly (Piece | null)[] {
    if (this.strategy === 'seeded-bag') return currentTray

    const result: (Piece | null)[] = [...currentTray]
    for (let i = 0; i < result.length; i++) {
      const p = result[i]
      if (p === null || p === undefined) continue
      // already perfectly placeable + helpful → keep it
      if (board.hasAnyPlacement(p) && PieceGenerator.bestFillQualityScore(board, p) >= 4) continue
      // otherwise replace with a high-fill-quality piece that fits
      result[i] = PieceGenerator.findBestRescue(board, () => this.weightedDraw(), ctx ?? {})
    }
    return result
  }

  private nextTraySolvable (board: Board, ctx: GenerationContext): readonly [Piece, Piece, Piece] {
    const size = board.size
    const total = size * size
    let filled = 0
    for (let i = 0; i < board.cells.length; i++) if (board.cells[i] !== 0) filled++
    const fillRatio = filled / total
    const sparse = fillRatio < 0.20
    const crowded = fillRatio > 0.6
    const veryCrowded = fillRatio > 0.75
    // skip clear-scoring when no line is reachable in one move (cheap up-front check)
    const evaluateClears = !sparse && PieceGenerator.anyNearFullLine(board, 3)
    // require multiple placements per piece — relax when board is very full
    const minPlacementsPerPiece = veryCrowded ? 1 : 2

    // per-piece work caches — same piece often reappears across candidate trays
    const placeCache = new Map<string, number>()
    const fillCache = new Map<string, number>()
    const edgeCache = new Map<string, boolean>()
    const clearCache = new Map<string, number>()

    const placeCountCached = (p: Piece): number => {
      let v = placeCache.get(p.id)
      if (v === undefined) {
        v = PieceGenerator.placementCount(board, p, minPlacementsPerPiece)
        placeCache.set(p.id, v)
      }
      return v
    }

    // FAST PATH: near-empty board — clears impossible, snug-fit pointless. Just pick first
    // tray that fits as a sequence and isn't full of awkward shapes.
    if (sparse) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const t0 = this.weightedDraw()
        const t1 = this.weightedDraw()
        const t2 = this.weightedDraw()
        const tray: readonly [Piece, Piece, Piece] = [t0, t1, t2]
        let bad = false
        for (const p of tray) {
          if (p.id.startsWith(PieceGenerator.DIAGONAL_PREFIX)) { bad = true; break }
        }
        if (bad) continue
        if (!PieceGenerator.anyPermutationFits(board, tray)) continue
        return tray
      }
      // fall through to the full path if we couldn't avoid diagonals
    }

    let bestTray: readonly [Piece, Piece, Piece] | null = null
    let bestScore = -Infinity
    const MAX_ATTEMPTS = sparse ? 12 : 25
    // tray with 2 line clears + at most one diagonal — about as good as it gets, exit early
    const SATISFYING_SCORE = 2 * PieceGenerator.CLEAR_REWARD

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const t0 = this.weightedDraw()
      const t1 = this.weightedDraw()
      const t2 = this.weightedDraw()
      const tray: readonly [Piece, Piece, Piece] = [t0, t1, t2]

      // crowded boards reject trays containing pieces > 4 cells
      if (crowded) {
        const maxCells = Math.max(t0.cells.length, t1.cells.length, t2.cells.length)
        if (maxCells > 4) continue
      }

      // each piece must independently fit on current board with enough placements (no trap trays)
      let perPieceOk = true
      for (const p of tray) {
        if (placeCountCached(p) < minPlacementsPerPiece) {
          perPieceOk = false
          break
        }
      }
      if (!perPieceOk) continue

      // some sequence of all 3 pieces must fit together
      if (!PieceGenerator.anyPermutationFits(board, tray)) continue

      const score = PieceGenerator.scoreTrayComposite(board, tray, evaluateClears, ctx, fillCache, edgeCache, clearCache)
      if (score > bestScore) { bestTray = tray; bestScore = score }
      if (score >= SATISFYING_SCORE) return tray
    }

    if (bestTray !== null) return bestTray

    // fallback: relax constraints — just need each piece to have *some* placement
    for (let attempt = 0; attempt < 20; attempt++) {
      const t0 = this.weightedDraw()
      const t1 = this.weightedDraw()
      const t2 = this.weightedDraw()
      const tray: readonly [Piece, Piece, Piece] = [t0, t1, t2]
      if (PieceGenerator.anyPermutationFits(board, tray)) return tray
    }

    // final fallback: per-slot first-fitting draws
    return [
      PieceGenerator.firstFitting(board, () => this.weightedDraw()),
      PieceGenerator.firstFitting(board, () => this.weightedDraw()),
      PieceGenerator.firstFitting(board, () => this.weightedDraw())
    ] as const
  }

  private static readonly DIAGONAL_PENALTY = 25
  private static readonly L_SMALL_PENALTY = 8
  private static readonly EDGE_ONLY_PENALTY = 6
  private static readonly CLEAR_REWARD = 80
  private static readonly FILL_PER_NEIGHBOR = 1
  private static readonly CELL_COVERAGE_BONUS = 1
  // per repeat above the first occurrence in recent history. small relative to clear bonuses
  // so it doesn't override "this piece would clear 2 lines" decisions, but enough to shift
  // ties toward variety
  private static readonly REPEAT_PENALTY = 6
  private static readonly DIAGONAL_PREFIX = 'diag-'
  private static readonly L_SMALL_PREFIX = 'L-small-'

  // urgency multipliers — they amplify the clear/fill rewards when the player needs help or is on a streak
  // urgency from "rounds since last clear": ramps from 1.0 (just cleared) → ~3.7 (10 rounds without a clear)
  private static computeUrgency (ctx: GenerationContext): number {
    const r = ctx.roundsSinceClear ?? 0
    return 1 + Math.min(r, 10) * 0.27
  }

  // streak amplifier: when player is comboing, weight clears even harder so the streak survives
  private static computeStreakBoost (ctx: GenerationContext): number {
    const s = ctx.streak ?? 0
    if (s <= 0) return 1
    return 1 + Math.min(s, 5) * 0.4
  }

  // hole-pressure: when player has fragmented the board, prefer pocket-filling (snug) pieces
  private static computeHolePressure (ctx: GenerationContext): number {
    const h = ctx.recentHolesCreated ?? 0
    return 1 + Math.min(h, 8) * 0.25
  }

  private static scoreTrayComposite (
    board: Board,
    tray: readonly [Piece, Piece, Piece],
    evaluateClears: boolean,
    ctx: GenerationContext,
    fillCache: Map<string, number>,
    edgeCache: Map<string, boolean>,
    clearCache: Map<string, number>
  ): number {
    let s = 0

    const urgency = PieceGenerator.computeUrgency(ctx)
    const streakBoost = PieceGenerator.computeStreakBoost(ctx)
    const holePressure = PieceGenerator.computeHolePressure(ctx)

    // shape penalties (heavily discourage awkward pieces — even more when player is struggling)
    for (const p of tray) {
      if (p.id.startsWith(PieceGenerator.DIAGONAL_PREFIX)) s -= PieceGenerator.DIAGONAL_PENALTY * urgency
      else if (p.id.startsWith(PieceGenerator.L_SMALL_PREFIX)) s -= PieceGenerator.L_SMALL_PENALTY * urgency
    }

    // line-clear reward — single-piece scan (no allocation, no DFS). good enough in practice
    // since multi-piece chained clears are rare and the engine doesn't need to find the optimal sequence
    if (evaluateClears) {
      let bestClears = 0
      for (const p of tray) {
        let c = clearCache.get(p.id)
        if (c === undefined) {
          c = PieceGenerator.singlePieceMaxClears(board, p)
          clearCache.set(p.id, c)
        }
        if (c > bestClears) bestClears = c
      }
      if (bestClears > 0) s += bestClears * PieceGenerator.CLEAR_REWARD * urgency * streakBoost
    }

    // fill-quality reward — boosted when board has many fragmented holes
    for (const p of tray) {
      let f = fillCache.get(p.id)
      if (f === undefined) {
        f = PieceGenerator.bestFillQualityScore(board, p)
        fillCache.set(p.id, f)
      }
      s += f * PieceGenerator.FILL_PER_NEIGHBOR * holePressure
    }

    // edge-no-use: piece whose ONLY placements touch the board edge fragments mid-board
    for (const p of tray) {
      let e = edgeCache.get(p.id)
      if (e === undefined) {
        e = PieceGenerator.isEdgeOnly(board, p)
        edgeCache.set(p.id, e)
      }
      if (e) s -= PieceGenerator.EDGE_ONLY_PENALTY
    }

    // anti-repeat: prevent the same piece (esp. high-weight rectangles) from dominating tray after tray
    const recent = ctx.recentPieceIds
    if (recent !== undefined && recent.length > 0) {
      // count occurrences within both the candidate tray itself AND the recent history
      const counts = new Map<string, number>()
      for (const id of recent) counts.set(id, (counts.get(id) ?? 0) + 1)
      for (const p of tray) {
        const c = counts.get(p.id) ?? 0
        // first occurrence is free; each additional occurrence costs REPEAT_PENALTY
        if (c >= 1) s -= PieceGenerator.REPEAT_PENALTY * c
        counts.set(p.id, c + 1)
      }
    }

    // small bonus per cell covered (favours rectangles when fitting)
    for (const p of tray) s += p.cells.length * PieceGenerator.CELL_COVERAGE_BONUS

    return s
  }

  // computes max lines clearable by placing `piece` in any single position on `board`.
  // pure read-only — no allocation, no board mutation. uses the "would this row be full
  // after placement" check by walking each affected row/col once.
  private static singlePieceMaxClears (board: Board, piece: Piece): number {
    const size = board.size
    const cells = board.cells
    let best = 0

    for (let r = 0; r + piece.height <= size; r++) {
      outer: for (let c = 0; c + piece.width <= size; c++) {
        // does the piece fit here?
        for (const [dr, dc] of piece.cells) {
          if (cells[(r + dr) * size + (c + dc)] !== 0) continue outer
        }

        // collect rows and cols this placement covers
        const touchedRows = new Set<number>()
        const touchedCols = new Set<number>()
        for (const [dr, dc] of piece.cells) {
          touchedRows.add(r + dr)
          touchedCols.add(c + dc)
        }

        let cleared = 0

        for (const rowR of touchedRows) {
          let allCovered = true
          for (let cc = 0; cc < size; cc++) {
            if (cells[rowR * size + cc] !== 0) continue
            // is (rowR, cc) covered by this placement?
            let covered = false
            for (const [dr, dc] of piece.cells) {
              if (r + dr === rowR && c + dc === cc) { covered = true; break }
            }
            if (!covered) { allCovered = false; break }
          }
          if (allCovered) cleared++
        }

        for (const colC of touchedCols) {
          let allCovered = true
          for (let rr = 0; rr < size; rr++) {
            if (cells[rr * size + colC] !== 0) continue
            let covered = false
            for (const [dr, dc] of piece.cells) {
              if (r + dr === rr && c + dc === colC) { covered = true; break }
            }
            if (!covered) { allCovered = false; break }
          }
          if (allCovered) cleared++
        }

        if (cleared > best) best = cleared
      }
    }
    return best
  }

  // returns true when every valid placement of `piece` touches the board's outer edge
  private static isEdgeOnly (board: Board, piece: Piece): boolean {
    const size = board.size
    const cells = board.cells
    let foundInterior = false
    for (let r = 0; r + piece.height <= size; r++) {
      for (let c = 0; c + piece.width <= size; c++) {
        let fits = true
        for (const [dr, dc] of piece.cells) {
          if (cells[(r + dr) * size + (c + dc)] !== 0) { fits = false; break }
        }
        if (!fits) continue
        // interior placement = not touching any boundary
        if (r > 0 && c > 0 && r + piece.height < size && c + piece.width < size) {
          foundInterior = true
          break
        }
      }
      if (foundInterior) break
    }
    // at least one valid placement existed (otherwise we'd have rejected the tray earlier)
    // edge-only iff no interior placement found
    return !foundInterior
  }

  // pick the piece (out of `attempts` weighted draws) with the highest fill-quality score that fits
  private static findBestRescue (
    board: Board,
    draw: () => Piece,
    _ctx: GenerationContext
  ): Piece {
    let best: Piece | null = null
    let bestScore = -Infinity
    for (let i = 0; i < 20; i++) {
      const p = draw()
      if (!board.hasAnyPlacement(p)) continue
      const fill = PieceGenerator.bestFillQualityScore(board, p)
      const sizeBonus = p.cells.length
      const penalty = p.id.startsWith(PieceGenerator.DIAGONAL_PREFIX) ? 20
        : p.id.startsWith(PieceGenerator.L_SMALL_PREFIX) ? 6 : 0
      const score = fill + sizeBonus - penalty
      if (score > bestScore) { best = p; bestScore = score }
    }
    if (best !== null) return best
    // last-resort scan
    for (const p of PIECES) {
      if (board.hasAnyPlacement(p)) return p
    }
    return draw()
  }

  // returns the maximum across all valid placements of:
  //   sum over piece cells of (orthogonal neighbors that are filled, off-board, or piece-internal)
  // higher score = piece fits more snugly into the existing structure
  private static bestFillQualityScore (board: Board, piece: Piece): number {
    const size = board.size
    const cells = board.cells
    let best = 0
    const maxPossible = piece.cells.length * 4

    for (let r = 0; r + piece.height <= size; r++) {
      outer: for (let c = 0; c + piece.width <= size; c++) {
        for (const [dr, dc] of piece.cells) {
          if (cells[(r + dr) * size + (c + dc)] !== 0) continue outer
        }
        let goodNeighbors = 0
        for (const [dr, dc] of piece.cells) {
          const cellR = r + dr
          const cellC = c + dc
          for (const [ddr, ddc] of ORTHO_DIRS) {
            const nr = cellR + ddr
            const nc = cellC + ddc
            if (nr < 0 || nc < 0 || nr >= size || nc >= size) { goodNeighbors++; continue }
            let inPiece = false
            for (const [pdr, pdc] of piece.cells) {
              if (r + pdr === nr && c + pdc === nc) { inPiece = true; break }
            }
            if (inPiece) { goodNeighbors++; continue }
            if (cells[nr * size + nc] !== 0) goodNeighbors++
          }
        }
        if (goodNeighbors > best) best = goodNeighbors
        if (best === maxPossible) return best
      }
    }
    return best
  }

  // counts placements of `piece` on `board`, short-circuiting at `cap`
  private static placementCount (board: Board, piece: Piece, cap: number): number {
    const size = board.size
    const cells = board.cells
    let count = 0
    for (let r = 0; r + piece.height <= size; r++) {
      outer: for (let c = 0; c + piece.width <= size; c++) {
        for (const [dr, dc] of piece.cells) {
          if (cells[(r + dr) * size + (c + dc)] !== 0) continue outer
        }
        count++
        if (count >= cap) return count
      }
    }
    return count
  }

  private static anyNearFullLine (board: Board, missingThreshold: number): boolean {
    const size = board.size
    for (let r = 0; r < size; r++) {
      let empty = 0
      for (let c = 0; c < size; c++) if (board.cells[r * size + c] === 0) empty++
      if (empty > 0 && empty <= missingThreshold) return true
    }
    for (let c = 0; c < size; c++) {
      let empty = 0
      for (let r = 0; r < size; r++) if (board.cells[r * size + c] === 0) empty++
      if (empty > 0 && empty <= missingThreshold) return true
    }
    return false
  }

  private static firstFitting (board: Board, draw: () => Piece): Piece {
    for (let i = 0; i < 30; i++) {
      const p = draw()
      if (board.hasAnyPlacement(p)) return p
    }
    for (const p of PIECES) {
      if (board.hasAnyPlacement(p)) return p
    }
    return draw()
  }

  private static anyPermutationFits (board: Board, tray: readonly [Piece, Piece, Piece]): boolean {
    for (const perm of PERMS) {
      const seq: Piece[] = [tray[perm[0]!]!, tray[perm[1]!]!, tray[perm[2]!]!]
      if (PieceGenerator.sequenceFits(board, seq)) return true
    }
    return false
  }

  private static sequenceFits (board: Board, seq: readonly Piece[]): boolean {
    return PieceGenerator.dfs(board.snapshot(), seq, 0)
  }

  private static dfs (snap: { size: number, cells: Uint8Array }, seq: readonly Piece[], idx: number): boolean {
    if (idx === seq.length) return true

    const piece = seq[idx]!
    const size = snap.size

    for (let r = 0; r + piece.height <= size; r++) {
      outer: for (let c = 0; c + piece.width <= size; c++) {
        for (const [dr, dc] of piece.cells) {
          if (snap.cells[(r + dr) * size + (c + dc)] !== 0) continue outer
        }
        const next = { size, cells: new Uint8Array(snap.cells) }
        for (const [dr, dc] of piece.cells) {
          next.cells[(r + dr) * size + (c + dc)] = 1
        }

        const fullRows: number[] = []
        const fullCols: number[] = []
        for (let rr = 0; rr < size; rr++) {
          let full = true
          for (let cc = 0; cc < size; cc++) if (next.cells[rr * size + cc] === 0) { full = false; break }
          if (full) fullRows.push(rr)
        }
        for (let cc = 0; cc < size; cc++) {
          let full = true
          for (let rr = 0; rr < size; rr++) if (next.cells[rr * size + cc] === 0) { full = false; break }
          if (full) fullCols.push(cc)
        }
        for (const rr of fullRows) for (let cc = 0; cc < size; cc++) next.cells[rr * size + cc] = 0
        for (const cc of fullCols) for (let rr = 0; rr < size; rr++) next.cells[rr * size + cc] = 0

        if (PieceGenerator.dfs(next, seq, idx + 1)) return true
      }
    }
    return false
  }
}

