import { FC, useMemo } from 'preact/compat'
import qrcode from 'qrcode-generator'

interface DonationQrProps {
  value: string
  size?: number
}

export const DonationQr: FC<DonationQrProps> = ({ value, size = 160 }) => {
  const cells = useMemo(() => {
    const qr = qrcode(0, 'M')

    qr.addData(value)
    qr.make()

    const count = qr.getModuleCount()
    const rects: { x: number, y: number }[] = []

    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          rects.push({ x: col, y: row })
        }
      }
    }

    return { count, rects }
  }, [value])

  return (
    <svg
      class='donation-qr'
      width={size}
      height={size}
      viewBox={`-2 -2 ${cells.count + 4} ${cells.count + 4}`}
      shape-rendering='crispEdges'
      aria-label='qr code'
    >
      <rect x='-2' y='-2' width={cells.count + 4} height={cells.count + 4} fill='#161616' />
      {cells.rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width='1' height='1' fill='#f5f5f5' />
      ))}
    </svg>
  )
}
