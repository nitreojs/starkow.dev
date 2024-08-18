import { FC } from 'preact/compat'
import { useEffect, useRef } from 'preact/hooks'

export const NoiseCanvas: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    const generateNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const imageData = ctx.createImageData(width, height)
      const buffer32 = new Uint32Array(imageData.data.buffer)

      for (let i = 0; i < buffer32.length; i++) {
        buffer32[i] = ((Math.random() * 255) | 0) << 24
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const animate = (fps: number = 30) => {
      generateNoise(ctx, canvas.width, canvas.height)

      setTimeout(() => requestAnimationFrame(() => animate(fps)), 1000 / fps)
    }

    const start = () => {
      resize()
      animate(15)
    }

    window.addEventListener('resize', resize)

    const handleLoad = () => {
      if (canvas) {
        canvas.style.display = 'block'
      }

      start()
    }

    window.addEventListener('load', handleLoad)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return (
    <canvas ref={canvasRef} id='noise'></canvas>
  )
}
