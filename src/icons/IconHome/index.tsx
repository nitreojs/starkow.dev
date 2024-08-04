import { ComponentProps } from 'preact'
import { FC } from 'preact/compat'

export const IconHome: FC<ComponentProps<'svg'>> = ({ width = '1.5rem', height = '1.5rem', ...props }) => (
  <svg fill="currentcolor" width={width} height={height} viewBox="0 0 32 32" enable-background="new 0 0 32 32" {...props}>
    <path d="M30.854,16.548C30.523,17.43,29.703,18,28.764,18H28v11c0,0.552-0.448,1-1,1h-6v-7c0-2.757-2.243-5-5-5  s-5,2.243-5,5v7H5c-0.552,0-1-0.448-1-1V18H3.235c-0.939,0-1.759-0.569-2.09-1.451c-0.331-0.882-0.088-1.852,0.62-2.47L13.444,3.019  c1.434-1.357,3.679-1.357,5.112,0l11.707,11.086C30.941,14.696,31.185,15.666,30.854,16.548z" id="XMLID_219_"/>
  </svg>
)