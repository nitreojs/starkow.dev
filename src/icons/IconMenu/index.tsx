import { ComponentProps, FC } from 'preact/compat'

export const IconMenu: FC<ComponentProps<'svg'>> = ({ width = '1.5rem', height = '1.5rem', ...props }) => (
  <svg viewBox='0 0 24 24' width={width} height={height} fill='none' {...props}>
    <path d='M4 6H20M4 12H20M4 18H20' stroke='currentcolor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
  </svg>
)
