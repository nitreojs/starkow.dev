const COOKIE = 'admin-key'

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const parts = document.cookie.split('; ')

  for (const raw of parts) {
    const eq = raw.indexOf('=')

    if (eq === -1) {
      continue
    }

    const key = raw.slice(0, eq)

    if (key === name) {
      return decodeURIComponent(raw.slice(eq + 1))
    }
  }

  return null
}

const writeCookie = (name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365) => {
  if (typeof document === 'undefined') {
    return
  }

  const encoded = encodeURIComponent(value)

  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}

const clearCookie = (name: string) => {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

export const getAdminKey = (): string | null => readCookie(COOKIE)

export const setAdminKey = (key: string) => writeCookie(COOKIE, key)

export const clearAdminKey = () => clearCookie(COOKIE)

// picks up ?admin-key=xxx from the url and stores it in a cookie, then strips it
export const hydrateAdminKeyFromUrl = () => {
  if (typeof window === 'undefined') {
    return
  }

  const params = new URLSearchParams(window.location.search)
  const key = params.get('admin-key')

  if (key === null) {
    return
  }

  if (key === '') {
    clearAdminKey()
  } else {
    setAdminKey(key)
  }

  params.delete('admin-key')

  const nextQuery = params.toString()
  const nextUrl = window.location.pathname + (nextQuery === '' ? '' : `?${nextQuery}`) + window.location.hash

  window.history.replaceState(null, '', nextUrl)
}
