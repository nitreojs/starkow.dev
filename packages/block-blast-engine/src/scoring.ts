export type PlacementInput = {
  readonly cellsPlaced: number
  readonly linesCleared: number
  readonly cellsCleared: number
  readonly prevStreak: number
}

export type PlacementResult = {
  readonly pointsGained: number
  readonly newStreak: number
}

export const applyPlacement = (input: PlacementInput): PlacementResult => {
  const newStreak = input.linesCleared > 0 ? input.prevStreak + 1 : 0

  const lineBonus = input.linesCleared > 0
    ? 10 * input.cellsCleared * input.linesCleared * (1 + newStreak)
    : 0

  return {
    pointsGained: input.cellsPlaced + lineBonus,
    newStreak
  }
}
