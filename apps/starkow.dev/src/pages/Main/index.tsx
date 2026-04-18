import { FC } from 'preact/compat'
import { ButtonsBlockSection, DonationsSection, FooterSection, LetterboxSection, NotificationsSection, ShoutboxSection, SkillsSection, SpotifySection, WelcomeSection, WhatDoIDoSection } from '../../sections'
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
              'a telegram channel that notifies people when new gifts or upgrades for gifts release. ',
              { type: 'highlight', children: [ 'first of its kind!' ] }
            ],
            tags: ['telegram', 'current'],
            accentFrom: '#ff2a2a',
            accentTo: '#250808',
            language: 'typescript'
          },
          {
            name: 'calcmulabot',
            url: 'https://t.me/calcmulabot',
            description: [
              'a telegram bot for various calculations ',
              { type: 'muted', children: [ '(e.g. currencies or measures)' ] },
              ' with its own ',
              { type: 'highlight', children: [ 'programming language' ] },
              '. what\'s ',
              { type: 'code', children: [ '100 + 10%' ] },
              ', btw?'
            ],
            tags: ['telegram', 'bot', 'current'],
            accentFrom: '#ffffff',
            accentTo: '#2aaf99',
            language: 'typescript'
          },
          {
            name: 'puregram',
            url: 'https://github.starkow.dev/puregram',
            description: [
              'a telegram bot api wrapper. ',
              { type: 'highlight', children: [ 'yeah that\'s it what else did you expect here' ] }
            ],
            tags: ['telegram', 'stale', 'bro', 'i', 'love', 'these', 'tags', 'they\'re', 'fun', 'af'],
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
            tags: ['bot', 'archived', 'deprecated']
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

      <FooterSection />

      <section class='barcode-container'>
        <Icons.IconQRCode />
      </section>
    </>
  )
}