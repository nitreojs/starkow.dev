import clsx from 'clsx'
import { FC, JSX, useState } from 'preact/compat'

import './style.css'

interface SpoilerProps {
  text: JSX.Element | string
}

export const Spoiler: FC<SpoilerProps> = ({ text }) => {
  let [shown, setShown] = useState(false)

  return (
    <span class={clsx('spoilered', shown && 'spoiler-shown')} onClick={() => setShown(s => !s)}>
      <span class='text-half-visible'>
        <i>{text}</i>
      </span>
    </span>
  )
}
