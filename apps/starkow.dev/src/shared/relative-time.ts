const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export const formatRelativeTime = (date: number | Date, now: number = Date.now()): string => {
  const then = typeof date === 'number' ? date : date.getTime()
  const diff = now - then

  if (diff < 0) {
    return 'in the future'
  }

  if (diff < 30_000) {
    return 'just now'
  }

  if (diff < MINUTE) {
    return `${Math.floor(diff / 1000)}s ago`
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE)

    return `${minutes}m ago`
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR)

    return `${hours}h ago`
  }

  if (diff < 2 * DAY) {
    return 'yesterday'
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY)

    return `${days}d ago`
  }

  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK)

    return `${weeks}w ago`
  }

  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH)

    return `${months}mo ago`
  }

  const years = Math.floor(diff / YEAR)

  return `${years}y ago`
}
