export type RngState = { s: number }

export interface Rng {
  next: () => number
  _state: RngState
}

export const createRng = (seed: number): Rng => {
  const state: RngState = { s: seed >>> 0 }

  const rng: Rng = {
    _state: state,
    next: () => {
      state.s = (state.s + 0x6D2B79F5) >>> 0
      let t = state.s
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  return rng
}

export const serializeRng = (rng: Rng): RngState => ({ s: rng._state.s })

export const hydrateRng = (state: RngState): Rng => createRng(state.s)
