import { useEffect, useRef } from 'preact/hooks'

import { resolveHostname, rotateTitle } from '@starkow.dev/shared/utils'

export const useRotatingTitle = () => {
  const domain = resolveHostname(window.location.hostname)
  const initialTitle = domain.replace(/\./g, '★')

  const titleRef = useRef(`${initialTitle} `)

  return useEffect(() => {
    const timer = setInterval(() => {
      titleRef.current = rotateTitle(titleRef.current)

      document.title = titleRef.current
    }, 500)

    return () => clearInterval(timer)
  }, [])
}
