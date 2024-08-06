import { useState, type FC } from 'preact/compat'
// import { IconSend2 } from '@tabler/icons-react'

import { IconLoaderX, IconSend } from '../../icons'

import { CoolButton } from '../../components'
import { useNotifications } from '../../hooks'
import { NotificationType } from '../../types'
import { API_URL } from '../../shared/constants'

interface LetterboxSectionProps {}

const placeholders = [
  'hello!',
  'ur cute',
  'привеет',
  'please marry me',
  'how are you doing?',
  'ах тыж сука',
  'балбес',
  'зачем я этот плейсхолдер сюда написал',
  'v3 when',
  'за вами выехали',
  'здесь могла быть ваша реклама',
  'меня здесь нет',
  'я думаю',
  'съешь ещё этих мягких французских булок',
  'ты ещё здесь?',
  'если бы не ты, то кто?',
  'а ты точно это ищешь?',
  'где моя пицца?',
  'я тебе точно отвечу'
]

const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export const LetterboxSection: FC<LetterboxSectionProps> = ({}) => {
  const [placeholder] = useState(getRandomElement(placeholders))
  const [textareaText, setTextareaText] = useState('')
  const [isLoading, setLoading] = useState(false)

  const { addNotification } = useNotifications()

  const notify = async (message: string) => {
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })

      const json = await response.json()

      setLoading(false)

      if (!json.ok) {
        addNotification('failed to send message through the letterbox: ' + json.error, NotificationType.Error)
      } else {
        setTextareaText('')
        addNotification('message has been successfully sent!', NotificationType.Success)
      }
    } catch (error) {
      return console.error(error)
    }
  }

  const isDisabled = textareaText.length === 0 || textareaText.length > 1024

  return (
    <>
      <section id='letterbox'>
        <h2>anonymous letterbox</h2>
        <p>
          here you can type a message that will be anonymous {" "}
          <span class="text-half-visible">(i won't get to know who you are)</span> {" "}
          and will be delivered to me in a matter of seconds!
        </p>
        <p class="text-half-visible text-small">
          please <b>do not</b> send anything inappropriate, spam etc. etc. etc.
          i just wanna hear your thoughts and/or suggestions
        </p>
      </section>

      <section>
        <div class='letterbox-container'>
          <textarea
            value={textareaText}
            placeholder={placeholder}
            onChange={e => setTextareaText(e.currentTarget.value.trim())}
            disabled={isLoading}
          />
          <CoolButton
            icon={isLoading ? IconLoaderX : IconSend}
            onClick={() => notify(textareaText)}
            disabled={isLoading || isDisabled}
          />
        </div>
      </section>
    </>
  )
}