import { ComponentProps, FC } from 'preact/compat'

export const IconPause: FC<ComponentProps<'svg'>> = ({ width = '1.5rem', height = '1.5rem', ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M8 5V19M16 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
)
