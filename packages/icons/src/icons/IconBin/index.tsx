import { ComponentProps, FC } from 'preact/compat'

export const IconBin: FC<ComponentProps<'svg'>> = ({ width = '1.5rem', height = '1.5rem', ...props }) => (
  <svg width={width} height={height} viewBox='0 0 24 24' fill='none' {...props}>
    <path d='M5.73708 6.54391V18.9857C5.73708 19.7449 6.35257 20.3604 7.11182 20.3604H16.8893C17.6485 20.3604 18.264 19.7449 18.264 18.9857V6.54391M2.90906 6.54391H21.0909' stroke='currentcolor' stroke-width='1.7' stroke-linecap='round'/>
    <path d='M8 6V4.41421C8 3.63317 8.63317 3 9.41421 3H14.5858C15.3668 3 16 3.63317 16 4.41421V6' stroke='currentcolor' stroke-width='1.7' stroke-linecap='round'/>
  </svg>
)
