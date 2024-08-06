import { FC } from 'preact/compat'

import { CoolUrlButton } from '../../components'
import { IconGitHub, IconLastFm, IconSpotify, IconSteam, IconTelegram } from '../../icons'

export const ButtonsBlockSection: FC = () => (
  <section id='buttons'>
    <div class='buttons-block'>
      <CoolUrlButton icon={IconGitHub} label='github' url='https://fwd.starkow.dev/github' />
      <CoolUrlButton text='blog' icon={IconTelegram} url='https://fwd.starkow.dev/telegram' />
      <CoolUrlButton icon={IconSteam} label='steam' url='https://fwd.starkow.dev/steam' />
      <CoolUrlButton icon={IconSpotify} label='spotify' url='https://fwd.starkow.dev/spotify' />
      <CoolUrlButton text='shitpost' icon={IconTelegram} url='https://fwd.starkow.dev/shitpost' />
      <CoolUrlButton icon={IconLastFm} label='last.fm' url='https://fwd.starkow.dev/lastfm' />
      <CoolUrlButton text='music' icon={IconTelegram} url='https://fwd.starkow.dev/music' />
    </div>
  </section>
)
