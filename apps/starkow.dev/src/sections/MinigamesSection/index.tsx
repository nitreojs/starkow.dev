import { FC } from 'preact/compat'
import { Link } from 'wouter-preact'

import { MinigameButton } from './components/MinigameButton'

import './style.css'

export const MinigamesSection: FC = () => (
  <section id='minigames'>
    <h2>minigames</h2>
    <p>
      <span class='text-half-visible text-small'>
        bro i mean i dont even know what this website is about anymore man
      </span>
    </p>

    <div class='minigames-block'>
      <Link href='/blockblast' asChild>
        <MinigameButton
          theme='blockblast'
          text='blockblast'
          description={<>
            i was tired from ads in this game <br />
            so i made this on my website <br />
            completely free
          </>}
        />
      </Link>
      <Link href='/wordle' asChild>
        <MinigameButton
          theme='wordle'
          text='wordle'
          description={<>
            this one i dont know how to describe <br />
            yeah
          </>}
        />
      </Link>
    </div>
  </section>
)
