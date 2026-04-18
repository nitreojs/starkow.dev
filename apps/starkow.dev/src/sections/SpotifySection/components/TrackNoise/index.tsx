import { FC } from 'preact/compat'
import { useEffect, useRef } from 'preact/hooks'

import './style.css'

export const TrackNoise: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (canvas === null) {
      return
    }

    const ctx = canvas.getContext('2d')

    if (ctx === null) {
      return
    }

    let running = true

    const generate = (width: number, height: number) => {
      const imageData = ctx.createImageData(width, height)
      const buffer32 = new Uint32Array(imageData.data.buffer)

      for (let i = 0; i < buffer32.length; i++) {
        buffer32[i] = ((Math.random() * 255) | 0) << 24
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const resize = () => {
      const parent = canvas.parentElement

      if (parent === null) {
        return
      }

      const rect = parent.getBoundingClientRect()

      canvas.width = Math.max(1, Math.floor(rect.width))
      canvas.height = Math.max(1, Math.floor(rect.height))
    }

    const fps = 15
    const frameInterval = 1000 / fps
    let last = 0

    const tick = (now: number) => {
      if (!running) {
        return
      }

      if (now - last >= frameInterval) {
        last = now
        generate(canvas.width, canvas.height)
      }

      requestAnimationFrame(tick)
    }

    resize()
    requestAnimationFrame(tick)

    const observer = new ResizeObserver(resize)

    if (canvas.parentElement !== null) {
      observer.observe(canvas.parentElement)
    }

    return () => {
      running = false
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} class='track-noise' aria-hidden='true' />
}
