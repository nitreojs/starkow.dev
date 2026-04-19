export type Cell = readonly [row: number, col: number]

export type Piece = {
  readonly id: string
  readonly cells: readonly Cell[]
  readonly width: number
  readonly height: number
  // selection weight in the generator's roulette draw — higher = more common
  readonly weight: number
}

export type BoardSize = 8 | 10

export type ModeId = 'classic' | 'limited-moves' | 'big-board'

export type GeneratorStrategy = 'seeded-bag' | 'solvability-aware'

export type ModeConfig = {
  readonly id: ModeId
  readonly boardSize: BoardSize
  readonly maxMoves: number | null
  readonly generator: GeneratorStrategy
  readonly resumable: boolean
}

export type Move = {
  readonly trayIndex: 0 | 1 | 2
  readonly r: number
  readonly c: number
}

export type ClearResult = {
  readonly rows: readonly number[]
  readonly cols: readonly number[]
  readonly cellsCleared: number
}
