export type TimeBucket = 'dawn' | 'day' | 'dusk' | 'evening' | 'night'

export const getTimeBucket = (now = new Date()): TimeBucket => {
  const hour = now.getHours()

  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  if (hour >= 20 && hour < 23) return 'evening'
  return 'night'
}
