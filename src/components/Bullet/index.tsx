import { FC } from 'preact/compat'

import './style.css'

interface BulletProps {
  text: string
}

export const Bullet: FC<BulletProps> = ({ text }) => (
  <span class='bullet'>
    {text}
  </span>
)
