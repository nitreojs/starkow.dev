import { FC } from 'preact/compat'
import { ButtonsBlockSection, DonationsSection, LetterboxSection, NotificationsSection, ShoutboxSection, SkillsSection, SpotifySection, WelcomeSection, WhatDoIDoSection } from '../../sections'
import * as Icons from '@starkow.dev/icons'

export const MainPage: FC = () => {
  return (
    <>
      <NotificationsSection />
      <WelcomeSection />
      <WhatDoIDoSection
        projects={[
          {
            name: 'j++gram',
            url: 'https://jppgr.am',
            description: [
              'a custom ',
              { type: 'code', children: ['mtproto'] },
              ' telegram server made from scratch with my friend ',
              { type: 'link', href: 'https://t.me/evaqum', children: ['@evaqum'] }
            ],
            tags: ['wip', 'telegram', 'mtproto', 'current'],
            accentFrom: '#ffeb00',
            accentTo: '#252901',
            language: 'typescript'
          },
          {
            name: 'gift changes',
            url: 'https://t.me/GiftChanges',
            description: [
              'a telegram channel that notifies people when new gifts or upgrades for gifts release'
            ],
            tags: ['telegram', 'gifts', 'current'],
            accentFrom: '#ff2a2a',
            accentTo: '#250808',
            language: 'typescript'
          },
          {
            name: 'puregram',
            url: 'https://github.starkow.dev/puregram',
            description: [
              'a telegram bot api wrapper that is written in ',
              { type: 'bold', children: ['typescript'] }
            ],
            tags: ['telegram', 'stale'],
            accentFrom: '#1d84bb',
            accentTo: '#229ed9',
            language: 'typescript'
          },
          {
            name: 'anime ai bot',
            url: 'https://t.me/qq_2d_ai_bot',
            description: [
              'a telegram bot that transforms an image into an anime-style image. at its peak it had ',
              { type: 'highlight', children: ['more than 3.5 million users'] },
              '!'
            ],
            language: 'python',
            accentFrom: '#fc4ab8',
            accentTo: '#8b3896',
            tags: ['archived', 'deprecated']
          }
        ]}
      />
      <SkillsSection />
      <SpotifySection />
      <LetterboxSection />
      <ShoutboxSection />
      <DonationsSection />
      <ButtonsBlockSection />

      <hr />

      <footer>
        <p>
          brought to you by <b>starkow</b> with ❤️
        </p>
        <p>
          some design ideas were taken from <a href='https://jsopn.com'>jsopn.com</a>, <a href='https://es3n1n.eu'>es3n1n.eu</a> & <a href='https://tei.su'>tei.su</a>
        </p>
        <p>
          i've never written a real website before this one btw
        </p>
      </footer>

      <section class='barcode-container'>
        <Icons.IconQRCode />
      </section>
    </>
  )
}