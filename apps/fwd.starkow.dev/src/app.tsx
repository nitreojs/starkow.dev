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
    <div class='container'>
      <div class='grid'>
        <Item id='telegram' text='telegram' description='main telegram channel' url='https://fwd.starkow.dev/telegram' photoUrl='https://i.pinimg.com/564x/a5/63/16/a563169f4652393602a3174479adf45b.jpg' icon={<Icons.IconTelegram />} />
        <Item id='spotify' text='spotify' description='i listen' url='https://fwd.starkow.dev/spotify' photoUrl='https://i.pinimg.com/564x/bd/d9/b9/bdd9b9a40d8c55dd22a34b66f2d9debf.jpg' icon={<Icons.IconSpotify />} />
        <Item id='github' text='github' description='i code' url='https://fwd.starkow.dev/github' photoUrl='https://i.pinimg.com/564x/8b/4c/ab/8b4cabd6fc3a97b9ca33fc602dd143d1.jpg' icon={<Icons.IconGitHub />} />
        <Item id='shitpost' text='shitpost' description='i shitpost' url='https://fwd.starkow.dev/shitpost' photoUrl='https://i.pinimg.com/736x/68/92/e2/6892e23d836e73c54937df2fd7d73f34.jpg' icon={<Icons.IconTelegram />} />
        <Item id='vk' url='https://fwd.starkow.dev/vk' photoUrl='https://i.pinimg.com/564x/2e/a3/21/2ea3212db31d6c625ee73415a65017cf.jpg' icon={<Icons.IconVk />} isIconCentered />
        <Item id='soundcloud' url='https://fwd.starkow.dev/soundcloud' photoUrl='https://i.pinimg.com/564x/88/f7/b9/88f7b929fe6c54fb52482424c12935fc.jpg' icon={<Icons.IconSoundcloud />} isIconCentered />
        <Item id='music' text='music' description='i write song lyrics' url='https://fwd.starkow.dev/music' photoUrl='https://i.pinimg.com/564x/d7/31/66/d73166e23f776ead27f07fac5a435d70.jpg' icon={<Icons.IconTelegram />} />
        <Item id='lastfm' url='https://fwd.starkow.dev/lastfm' photoUrl='https://i.pinimg.com/736x/d5/06/2e/d5062e95aa790116cefcc026cf1ec99c.jpg' icon={<Icons.IconLastFm />} isIconCentered />
        <Item id='photos' text='photos' description="i take photos" url='https://fwd.starkow.dev/photos' photoUrl='https://i.pinimg.com/564x/ca/79/7a/ca797a0374e8cf7c03af330c136158eb.jpg' icon={<Icons.IconTelegram />} />
        <Item id='sources' text='sources' description='sources of this site' url='https://fwd.starkow.dev/github/starkow.dev' photoUrl='https://i.pinimg.com/564x/e2/fd/08/e2fd08d03094e9088f5db9906d5ea22a.jpg' icon={<Icons.IconGitHub />} />
        <Item id='back' url='https://starkow.dev' photoUrl='https://i.pinimg.com/564x/13/15/01/13150186d9738e3abc77ca3006f95f2a.jpg' icon={<Icons.IconHome />} isIconCentered shouldOpenInNewTab={false} />
      </div>

      <div class='container-title'>
        <h2>fwd.starkow.dev</h2>
        <p class='text-small'>
          collection of all the important links
        </p>
      </div>
    </div>
  )
}
