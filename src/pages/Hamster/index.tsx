import { FC } from 'preact/compat'

import { IconHamster, IconReload } from '../../icons'
import { CoolButton } from '../../components'

interface HamsterPageProps {
  onButtonClick: () => void
}

export const HamsterPage: FC<HamsterPageProps> = ({ onButtonClick }) => {
  return (
    <div class="hamster-container-centered">
      <IconHamster />

      <p>
        <span class="text-half-visible text-small">i am just a little hamster...</span>
        <br />
        <span class="text-half-visible text-small">i just wanna be happy...</span>
      </p>

      <p>
        you've discovered a rare <i>hamsterful</i> page...
        <br />
        you can <i>admire the beauty</i> of this hamster <span class="text-half-visible">(me!)</span> and stay...
        <br />
        or <i>reload</i> the page and see it's actual contents...
      </p>

      <p>
        <span class="text-half-visible text-small">it's up to you to decide...</span>
        <br />
        <span class="text-half-visible text-small">again, i'm just a little hamster...</span>
      </p>

      <CoolButton icon={IconReload} onClick={onButtonClick} />
    </div>
  )
}