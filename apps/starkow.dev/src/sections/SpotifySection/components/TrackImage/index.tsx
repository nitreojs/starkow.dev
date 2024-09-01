import { FC } from 'preact/compat'

import * as Icons from '@starkow.dev/icons'

import type { TrackData } from '../../types'

import './style.css'

interface TrackImageProps {
  data: TrackData
}

export const TrackImage: FC<TrackImageProps> = ({ data }) => {
  return (
    <a class='track-image' href={data.url}>
      <img src={data.album.image} alt={data.album.name} />
      <div class='track-image-link'>
        <Icons.IconExternalLink />
      </div>
    </a>
  )
}