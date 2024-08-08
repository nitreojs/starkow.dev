import { FC } from 'preact/compat'

import * as Icons from '@starkow.dev/icons'

import './style.css'

interface BulletLinkProps {
  url: string
  text: string
}

export const BulletLink: FC<BulletLinkProps> = ({ url, text }) => (
  <a href={url}>
    <span class='bullet-link'>
      {text}
      <Icons.IconExternalLink />
    </span>
  </a>
)
