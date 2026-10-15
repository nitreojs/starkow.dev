export const COMBO_MISSES_ALLOWED = 2
export const BOARD_CLEAR_BONUS = 300

export type PlacementInput = {
  readonly cellsPlaced: number
  readonly linesCleared: number
  readonly boardCleared: boolean
  readonly combo: number
  readonly comboMisses: number
}

export type PlacementResult = {
  readonly pointsGained: number
  readonly combo: number
  readonly comboMisses: number
}

export const applyPlacement = (input: PlacementInput): PlacementResult => {
  const lines = input.linesCleared

  if (lines === 0) {
    const comboMisses = input.comboMisses + 1
    const broken = comboMisses > COMBO_MISSES_ALLOWED

    return {
      pointsGained: input.cellsPlaced,
      combo: broken ? 0 : input.combo,
      comboMisses: broken ? 0 : comboMisses
    }
  }

  const combo = input.combo + 1
  const linePoints = lines === 1 ? 10 * combo : 10 * combo * lines * (lines - 1)

  return {
    pointsGained: input.cellsPlaced + linePoints + (input.boardCleared ? BOARD_CLEAR_BONUS : 0),
    combo,
    comboMisses: 0
  }
}
