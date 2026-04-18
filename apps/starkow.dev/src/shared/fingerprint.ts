const KEY = 'starkow:fp'

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage disabled (private mode, storage quota, etc.) — ignore
  }
}

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const getFingerprint = (): string => {
  if (typeof window === 'undefined') {
    return ''
  }

  const existing = safeGetItem(KEY)

  if (existing !== null && existing !== '') {
    return existing
  }

  const fresh = generateUuid()

  safeSetItem(KEY, fresh)

  return fresh
}
