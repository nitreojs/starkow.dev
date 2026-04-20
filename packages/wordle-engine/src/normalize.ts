import type { Lang } from './types'

// allowed character ranges per language, applied after lowercase + ё→е
const EN_RE = /[a-z]/
const RU_RE = /[а-я]/

export const normalizeWord = (raw: string, lang: Lang): string => {
  const lower = raw.trim().toLowerCase()

  if (lower === '') {
    return ''
  }

  const mapped = lang === 'ru' ? lower.replace(/ё/g, 'е') : lower
  const allowed = lang === 'ru' ? RU_RE : EN_RE

  let out = ''

  for (const ch of mapped) {
    if (allowed.test(ch)) {
      out += ch
    }
  }

  return out
}
