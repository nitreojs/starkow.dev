export type Cell = readonly [row: number, col: number]

export type Piece = {
  readonly id: string
  readonly cells: readonly Cell[]
  readonly width: number
  readonly height: number
}

export type BoardSize = 8 | 10

export type ModeId = 'classic' | 'limited-moves' | 'big-board' | 'hold' | 'daily'

export type ModeConfig = {
  readonly id: ModeId
  readonly boardSize: BoardSize
  readonly maxMoves: number | null
  readonly resumable: boolean
  readonly hold: boolean
}

export type TrayIndex = 0 | 1 | 2

export type PlaceMove = {
  readonly kind: 'place'
  readonly trayIndex: TrayIndex
  readonly r: number
  readonly c: number
}

export type HoldMove = {
  readonly kind: 'hold'
  readonly trayIndex: TrayIndex
}

export type Move = PlaceMove | HoldMove

export type ClearResult = {
  readonly rows: readonly number[]
  readonly cols: readonly number[]
  readonly cellsCleared: number
}
