export type Lang = 'en' | 'ru'

export type Length = 4 | 5 | 6 | 7

export type Cell = 'green' | 'yellow' | 'gray'

export type Mask = Cell[]

export interface Row {
  guess: string
  mask: Mask
}

export type GameStatus = 'playing' | 'won' | 'lost'

export type Mode = 'daily' | 'infinite'

export const LANGS: readonly Lang[] = ['en', 'ru']

export const LENGTHS: readonly Length[] = [4, 5, 6, 7]
