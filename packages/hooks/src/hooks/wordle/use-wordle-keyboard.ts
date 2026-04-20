import { useEffect } from 'preact/compat'

import { normalizeWord, type Lang } from '@starkow.dev/wordle-engine'

interface Options {
  lang: Lang
  enabled: boolean
  onLetter: (letter: string) => void
  onBackspace: () => void
  onSubmit: () => void
}

export const useWordleKeyboard = ({ lang, enabled, onLetter, onBackspace, onSubmit }: Options): void => {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent): void => {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        onBackspace()
        return
      }

      // named keys (Shift, ArrowDown, …) have length > 1 — skip
      if (e.key.length !== 1) return

      const letter = normalizeWord(e.key, lang)

      if (letter.length === 1) {
        e.preventDefault()
        onLetter(letter)
      }
    }

    document.addEventListener('keydown', handler)

    return () => document.removeEventListener('keydown', handler)
  }, [lang, enabled, onLetter, onBackspace, onSubmit])
}
