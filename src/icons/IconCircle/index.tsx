import { ComponentProps, FC } from 'preact/compat'

export const IconCircle: FC<ComponentProps<'svg'>> = ({ width = '1.5rem', height = '1.5rem', ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...props}>
    <circle cx="12" cy="12" r="8" stroke="currentcolor" fill="none" stroke-width={2} />
  </svg>
)
