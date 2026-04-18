import { FC } from 'preact/compat'

import { Skill } from '../../components'
import { LetterboxSection } from '../LetterboxSection'
import { ShoutboxSection } from '../ShoutboxSection'

import './style.css'

export const WallSection: FC = () => (
  <>
    <section id='wall'>
      <h2>the wall</h2>
      <p>
        type a message: it will be {' '}
        <Skill name='anonymous' note="i won't get to know who you are" /> {' '}
        and delivered to me in seconds. some of them end up here, and some might even get an answer from me.
      </p>
      <p class='info-line'>
        <span class='info-label'>please avoid:</span> {' '}
        <Skill name='spam' note='one message is enough' disliked />
        <span class='skill-sep'>•</span>
        <Skill name='threats' note="not funny + don't care" disliked />
        <span class='skill-sep'>•</span>
        <Skill name='larp' note='imagine larping on this page LOL' disliked />
      </p>
    </section>

    <div class='wall-card'>
      <ShoutboxSection />

      <hr class='wall-divider' />

      <LetterboxSection />
    </div>
  </>
)
