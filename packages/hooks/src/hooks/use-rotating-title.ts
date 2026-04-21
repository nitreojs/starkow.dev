import { useEffect } from 'preact/hooks'

import { resolveHostname } from '@starkow.dev/shared/utils'

import { TITLE_ANIMATORS } from './title-animators'

let currentSuffix = ''

const buildTitle = (base: string) => {
  return currentSuffix ? `${base} • ${currentSuffix}` : base
}

const pickNextAnimator = (previousIndex: number) => {
  if (TITLE_ANIMATORS.length <= 1) {
    return 0
  }

  let next = Math.floor(Math.random() * TITLE_ANIMATORS.length)

  if (next === previousIndex) {
    next = (next + 1) % TITLE_ANIMATORS.length
  }

  return next
}

export const useTitleSuffix = (suffix: string) => {
  useEffect(() => {
    currentSuffix = suffix

    return () => {
      if (currentSuffix === suffix) {
        currentSuffix = ''
      }
    }
  }, [suffix])
}

export const useRotatingTitle = () => {
  const domain = resolveHostname(window.location.hostname)
  const base = domain.replace(/\./g, '★')

  return useEffect(() => {
    let frame = 0
    let animatorIndex = Math.floor(Math.random() * TITLE_ANIMATORS.length)
    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      const title = buildTitle(base)
      const result = TITLE_ANIMATORS[animatorIndex](title, frame)

      if (result === null) {
        animatorIndex = pickNextAnimator(animatorIndex)
        frame = 0
        const gap = 2000 + Math.floor(Math.random() * 3001)
        timeoutId = setTimeout(tick, gap)

        return
      }

      document.title = result.text
      frame += 1
      timeoutId = setTimeout(tick, result.delay)
    }

    tick()

    return () => clearTimeout(timeoutId)
  }, [])
}
