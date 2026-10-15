import { useCallback, useEffect, useRef, useState } from 'preact/compat'

import { ENGINE_VERSION } from '@starkow.dev/block-blast-engine'

import { startDaily } from './api'
import type { DailyStart } from './types'

export type BlockBlastDailyStatus = 'idle' | 'loading' | 'error' | 'outdated' | 'ready'

export const useBlockBlastDaily = (active: boolean) => {
  const [status, setStatus] = useState<BlockBlastDailyStatus>('idle')
  const [session, setSession] = useState<DailyStart | null>(null)
  const requestRef = useRef(0)

  const start = useCallback(async () => {
    const request = ++requestRef.current
    setStatus('loading')
    setSession(null)

    const res = await startDaily()
    if (request !== requestRef.current) return

    if (res === null) {
      setStatus('error')
      return
    }
    if (res.engineVersion !== ENGINE_VERSION) {
      setStatus('outdated')
      return
    }

    setSession(res)
    setStatus('ready')
  }, [])

  useEffect(() => {
    if (active) {
      void start()
      return
    }
    requestRef.current++
    setStatus('idle')
    setSession(null)
  }, [active, start])

  return { status, session, retry: start }
}
