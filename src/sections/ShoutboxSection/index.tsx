import { FC, useEffect, useState } from 'preact/compat'
// import { BulletLink } from '../../components'

import './style.css'
import { CoolButton } from '../../components'
import { useInterval } from '../../hooks'
import { API_URL } from '../../shared'
import { ShoutboxMessage as ShoutboxMessageType } from './types'

interface ShoutboxMessageProps {
  text: string
  date: number
  answer?: string
}

const ShoutboxMessage: FC<ShoutboxMessageProps> = ({ text, date, answer }) => {
  const hasAnswer = answer !== undefined

  return (
    <div class='shoutbox-message'>
      <div class='shoutbox-message-text'>
        <i>{text}</i>
      </div>
      {
        hasAnswer && (
          <div class='shoutbox-message-answer'>
            <b>answer</b>: <i>{answer}</i>
          </div>
        )
      }
      <div class='shoutbox-message-date'>
        {new Date(date).toLocaleString()}
      </div>
    </div>
  )
}

export const ShoutboxSection: FC = () => {
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [messages, setMessages] = useState<ShoutboxMessageType[]>([])

  const fetchShoutbox = async (page = 0) => {
    const response = await fetch(`${API_URL}/api/shoutbox?page=${page}`)
  
    const json = await response.json() as Record<string, any>

    if (!json.ok) {
      return // TODO
    }

    const data = json.data.items as ShoutboxMessageType[]

    setPage(json.data.page)
    setTotal(json.data.total)
    setMessages(data)
  }

  useEffect(() => {
    fetchShoutbox()
  }, [])

  useInterval(() => fetchShoutbox(), 15_000, [])

  return (
    <>
      <section id='shoutbox'>
        <h2>shoutbox</h2>
        <p>
          this is a place where people from around the world
          can leave a message for those who visit this site.
        </p>
        <p class='text-small text-half-visible'>
          <i><b>note:</b></i> {" "}
          shoutbox messages <b>are</b> moderated, so don't expect to post an insult or some other shit.
        </p>
      </section>

      <section>
        {
          messages.length === 0 ? (
            <div class='centered'>
              <p>no messages here, unfortunately</p>
              <p>maybe your message will be the first one here?</p>
            </div>
          ) : (
            <>
              <div class='shoutbox-pagination'>
                <CoolButton text='<' disabled={page === 0} onClick={() => fetchShoutbox(page - 1)} />
                <CoolButton text={String(page + 1)} />
                <CoolButton text='>' disabled={page + 1 >= Math.ceil(total / 5)} onClick={() => fetchShoutbox(page + 1)} />
              </div>
  
              <div class='shoutbox-container'>
                {
                  messages
                    .sort((a, b) => b.date - a.date)
                    .map((message, index) => (
                      <ShoutboxMessage key={index} {...message} />
                    ))
                }
              </div>
            </>
          )
        }
        
      </section>
    </>
  )
}
