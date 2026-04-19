import { FC } from 'preact/compat'
import { Link } from 'wouter-preact'

import { CoolButton, CoolUrlButton, Repository } from '../../components'

import './style.css'
import { IconChain } from '@starkow.dev/icons'

export const ButtonsBlockSection: FC = () => (
  <section id='buttons'>
    <div class='buttons-block'>
      <Repository url='https://fwd.starkow.dev/github/starkow.dev' />
      <CoolUrlButton icon={IconChain} text='links' url='https://fwd.starkow.dev' />
      <Link href='/blockblast' asChild>
        <CoolButton text='blockblast...?' />
      </Link>
    </div>
  </section>
)
