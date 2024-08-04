import { FC } from 'preact/compat'
import { ButtonsBlockSection, DonationsSection, LetterboxSection, NotificationsSection, SkillsSection, SpotifySection, WelcomeSection, WhatDoIDoSection } from '../../sections'
import { IconQRCode } from '../../icons'

export const MainPage: FC = () => {
  return (
    <>
      <NotificationsSection />
      <WelcomeSection />
      <WhatDoIDoSection
        projects={[
          {
            name: 'puregram',
            url: 'https://github.starkow.dev/puregram',
            description: 'a telegram bot api wrapper that is written in typescript. it is my main-priority project!'
          },
          {
            name: 'anime ai bot',
            url: 'https://t.me/qq_2d_ai_bot',
            description: 'a telegram bot that transforms an image into an anime-style image. at its peak it had more than 3.5 million users! as for now it is transferred to another owner.'
          }
        ]}
      />
      <SkillsSection />
      <SpotifySection />
      <LetterboxSection />
      <DonationsSection />
      {/* <ClickerSection /> */}
      {/* <TodoSection /> */}
      <ButtonsBlockSection />

      <hr />

      <footer>
        <p>
          brought to you by <b>starkow</b> with ❤️
        </p>
        <p>
          some design ideas were taken from <a href="https://jsopn.com">jsopn.com</a>, <a href="https://es3n1n.eu">es3n1n.eu</a> & <a href="https://tei.su">tei.su</a>
        </p>
        <p>
          i've never written a real website before this one btw
        </p>
      </footer>

      <section class="barcode-container">
        <IconQRCode />
      </section>
    </>
  )
}