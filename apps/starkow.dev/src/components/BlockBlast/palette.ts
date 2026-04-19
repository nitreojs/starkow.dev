const PALETTE = [
  '#4f8a7c',   // deep sage
  '#8a6d96',   // dim plum
  '#9c8765',   // dim ochre
  '#637a89',   // dim slate
  '#9c7373'    // dim rose
] as const

const hash = (s: string): number => {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export const colorForPiece = (pieceId: string): string => {
  return PALETTE[hash(pieceId) % PALETTE.length]!
}

export const EMPTY_CELL_COLOR = '#212121'
export const GHOST_VALID_COLOR = 'rgba(79, 138, 124, 0.35)'
export const GHOST_INVALID_COLOR = 'rgba(156, 115, 115, 0.35)'
