import { type FC, useEffect, useState } from 'preact/compat'
import useLocalStorageState from 'use-local-storage-state'

import { CoolButton } from '../../components'

const clickedToPhraseMap: Record<number, string> = {
  10000: 'dude seriously what the actual fuck are you doing okay fine let me block the button for you',
  3000: 'alright i wont respond anymore. bye.',
  1000: 'just why? i\'m not hiding anything i swear',
  750: 'you should probably stop',
  500: 'you really like clicking, don\'t you? i should remind you that there\'s literaly no prize',
  200: 'please don\'t tell me you\'re gonna click more and more. there\'s no prize for that, i swear!',
  100: 'chill out! this is just a random ass clicker. no need to be that serious about it...'
}

export const ClickerSection: FC = () => {
  const [clicked, setClicked] = useLocalStorageState('clicked-times', { defaultValue: 0 })
  const [clickerDescription, setClickerDescription] = useState('i kinda ran out of ideas for this section so here\'s a clicker i guess ¯\\_(ツ)_/¯')

  useEffect(() => {
    if (clicked in clickedToPhraseMap) {
      setClickerDescription(clickedToPhraseMap[clicked])
    }
  }, [clicked])

  return (
    <section id="clicker">
      <h2>just a clicker</h2>
      <p>{clickerDescription}</p>

      <CoolButton
        text={`${clicked}`}
        disabled={clicked >= 10000}
        onClick={() => {
          setClicked(v => v + 1)
        }}
      />
      
      <p>
        <span class="text-half-visible text-small">this number is persistent across page reloads!</span>
      </p>
    </section>
  )
}
