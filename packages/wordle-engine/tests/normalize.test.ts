import { describe, expect, it } from 'vitest'

import { normalizeWord } from '../src/normalize'

describe('normalizeWord', () => {
  it('lowercases english input', () => {
    expect(normalizeWord('Crane', 'en')).toBe('crane')
  })

  it('trims whitespace', () => {
    expect(normalizeWord('  Crane  ', 'en')).toBe('crane')
  })

  it('strips non-letter characters (en)', () => {
    expect(normalizeWord("crane!", 'en')).toBe('crane')
    expect(normalizeWord('cr4ne', 'en')).toBe('crne')
  })

  it('maps ё to е for ru', () => {
    expect(normalizeWord('Ёлка', 'ru')).toBe('елка')
    expect(normalizeWord('ёЁ', 'ru')).toBe('ее')
  })

  it('keeps cyrillic for ru but drops latin', () => {
    expect(normalizeWord('кот cat', 'ru')).toBe('кот')
  })

  it('keeps latin for en but drops cyrillic', () => {
    expect(normalizeWord('cat кот', 'en')).toBe('cat')
  })

  it('returns empty string on empty input', () => {
    expect(normalizeWord('', 'en')).toBe('')
    expect(normalizeWord('   ', 'ru')).toBe('')
  })
})
