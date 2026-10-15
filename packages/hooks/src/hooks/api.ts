export const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? ''
  : 'https://starkow.dev'

const FP_KEY = 'starkow:fp'

const generateFingerprint = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

const ensureFingerprint = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    const existing = localStorage.getItem(FP_KEY)
    if (existing !== null && existing !== '') return existing

    const fresh = generateFingerprint()

    try { localStorage.setItem(FP_KEY, fresh) } catch { /* storage disabled — still send header for this request */ }

    return fresh
  } catch { return null }
}

export const getFingerprintHeader = (): Record<string, string> => {
  const fp = ensureFingerprint()
  return fp !== null ? { 'x-fingerprint': fp } : {}
}
