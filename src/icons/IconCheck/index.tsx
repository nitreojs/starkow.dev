import { ComponentProps, FC } from 'preact/compat'

export const IconCheck: FC<ComponentProps<'svg'>> = ({ width = '1.5rem', height = '1.5rem', ...props }) => (
  <svg width={width} height={height} viewBox='0 0 24 24' fill='none' {...props}>
    <path d='M4 12.6111L8.92308 17.5L20 6.5' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
  </svg>
)
