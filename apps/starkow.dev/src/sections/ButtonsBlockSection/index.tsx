import { FC } from 'preact/compat'

import { CoolUrlButton } from '../../components'
import * as Icons from '@starkow.dev/icons'

export const ButtonsBlockSection: FC = () => (
  <section id='buttons'>
    <div class='buttons-block'>
      <CoolUrlButton icon={Icons.IconGitHub} label='github' url='https://fwd.starkow.dev/github' />
      <CoolUrlButton text='blog' icon={Icons.IconTelegram} url='https://fwd.starkow.dev/telegram' />
      <CoolUrlButton icon={Icons.IconSteam} label='steam' url='https://fwd.starkow.dev/steam' />
      <CoolUrlButton icon={Icons.IconSpotify} label='spotify' url='https://fwd.starkow.dev/spotify' />
      <CoolUrlButton text='shitpost' icon={Icons.IconTelegram} url='https://fwd.starkow.dev/shitpost' />
      <CoolUrlButton icon={Icons.IconLastFm} label='last.fm' url='https://fwd.starkow.dev/lastfm' />
      <CoolUrlButton text='music' icon={Icons.IconTelegram} url='https://fwd.starkow.dev/music' />
    </div>
  </section>
)
