import { FC, JSX } from 'preact/compat'
import clsx from 'clsx'

import { useRotatingTitle } from '@starkow.dev/hooks'
import * as Icons from '@starkow.dev/icons'

import './app.css'

interface ItemProps {
  id: string
  text?: string
  url: string
  photoUrl: string
  icon: JSX.Element
  isIconCentered?: boolean
  description?: string
  shouldOpenInNewTab?: boolean
}

const Item: FC<ItemProps> = ({ text, id, url, photoUrl, icon, isIconCentered, description, shouldOpenInNewTab = true }) => {
  return (
    <a
      href={url}
      target={clsx(shouldOpenInNewTab && '_blank')}
      rel='noopener noreferrer'
      class={clsx('item', `item-${id}`)}
    >
      <div class='item-image' style={{ backgroundImage: `url(${photoUrl})` }} />
      <div class={clsx(isIconCentered ? 'item-icon-centered' : 'item-icon')}>{icon}</div>
      <div class='item-text'>
        <div class='item-text-title'><b>{text}</b></div>
        <div class='item-text-description'>{description}</div>
      </div>
    </a>
  )
}

export function App() {
  useRotatingTitle()

  return (
    <>
      <div class='container'>
        <div class='grid'>
          <Item id='telegram' text='telegram' description='main telegram channel' url='https://fwd.starkow.dev/channel' photoUrl='/tiles/telegram.webp' icon={<Icons.IconTelegram />} />
          <Item id='spotify' text='spotify' description='i listen' url='https://fwd.starkow.dev/spotify' photoUrl='/tiles/spotify.webp' icon={<Icons.IconSpotify />} />
          <Item id='github' text='github' description='i code' url='https://fwd.starkow.dev/github' photoUrl='/tiles/github.webp' icon={<Icons.IconGitHub />} />
          <Item id='shitpost' text='shitpost' description='i shitpost' url='https://fwd.starkow.dev/shitpost' photoUrl='/tiles/shitpost.webp' icon={<Icons.IconTelegram />} />
          <Item id='vk' url='https://fwd.starkow.dev/vk' photoUrl='/tiles/vk.webp' icon={<Icons.IconVk />} isIconCentered />
          <Item id='lastfm' url='https://fwd.starkow.dev/lastfm' photoUrl='/tiles/lastfm.webp' icon={<Icons.IconLastFm />} isIconCentered />
          <Item id='sources' text='sources' description='sources of this site' url='https://fwd.starkow.dev/github/starkow.dev' photoUrl='/tiles/sources.webp' icon={<Icons.IconGitHub />} />
          <Item id='back' url='https://starkow.dev' photoUrl='/tiles/back.webp' icon={<Icons.IconHome />} isIconCentered shouldOpenInNewTab={false} />
        </div>

        <div class='container-title'>
          <h2>fwd.starkow.dev</h2>
          <p class='text-small'>
            collection of all the important links
          </p>
        </div>
      </div>
    </>
  )
}
