import { FC } from 'preact/compat'

import { IconExternalLink } from '../../icons'

import './style.css'

interface BulletLinkProps {
  url: string
  text: string
}

export const BulletLink: FC<BulletLinkProps> = ({ url, text }) => (
  <a href={url}>
    <span class='bullet-link'>
      {text}
      <IconExternalLink />
    </span>
  </a>
)
