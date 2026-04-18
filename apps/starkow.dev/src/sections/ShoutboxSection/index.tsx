import { FC, useCallback, useEffect, useState } from 'preact/compat'
import { useSetAtom } from 'jotai'
import clsx from 'clsx'

import { CoolButton, RichContent } from '../../components'
import { API_URL, autoLinkify, formatRelativeTime, getFingerprint } from '../../shared'
import { replyTarget$atom } from '../../state'
import { ShoutboxAnswer, ShoutboxMessage as ShoutboxMessageType } from './types'
import { Reactions } from './Reactions'
import { useInterval } from '@starkow.dev/hooks'
import { useNotifications } from '../../hooks'
import { NotificationType } from '../../types'

import './style.css'

const QUOTE_LIMIT = 120

const buildQuote = (text: string): string =>
  text.length > QUOTE_LIMIT ? text.slice(0, QUOTE_LIMIT) : text

interface ShoutboxMessageProps extends ShoutboxMessageType {
  availableReactions: string[]
  onToggleReaction: (id: string, emoji: string) => void
  onReply: (id: string, text: string) => void
}

const ANSWER_INDENT_CAP = 4

interface AnswerTreeProps {
  answers: ShoutboxAnswer[]
  index?: number
}

const AnswerTree: FC<AnswerTreeProps> = ({ answers, index = 0 }) => {
  if (index >= answers.length) {
    return null
  }

  const { content, date } = answers[index]
  const flatten = index >= ANSWER_INDENT_CAP

  return (
    <div class={clsx('shoutbox-answer', flatten && 'shoutbox-answer-flat')}>
      <div class='shoutbox-answer-content'>
        <RichContent content={content} />
      </div>
      <div class='shoutbox-answer-date' title={new Date(date).toLocaleString()}>
        {formatRelativeTime(date)}
      </div>
      <AnswerTree answers={answers} index={index + 1} />
    </div>
  )
}

const ShoutboxMessage: FC<ShoutboxMessageProps> = ({ id, text, content, date, pinned, replyTo, answers, reactions, yourReactions, availableReactions, onToggleReaction, onReply }) => (
  <div class={clsx('shoutbox-message', pinned && 'shoutbox-message-pinned')} id={`shoutbox-${id}`}>
    <button type='button' class='shoutbox-message-reply' onClick={() => onReply(id, text)}>
      [reply]
    </button>
    {pinned && (
      <div class='shoutbox-message-pin'>📌 pinned</div>
    )}
    {replyTo && (
      <a class='shoutbox-message-quote' href={`#shoutbox-${replyTo.id}`}>
        <span class='shoutbox-message-quote-text'>{replyTo.quote}</span>
      </a>
    )}
    <div class='shoutbox-message-text'>
      <RichContent content={content !== undefined && content.length > 0 ? content : autoLinkify(text)} />
    </div>
    {answers !== undefined && answers.length > 0 && (
      <AnswerTree answers={answers} />
    )}
    <div class='shoutbox-message-meta'>
      <Reactions
        available={availableReactions}
        reactions={reactions}
        yourReactions={yourReactions}
        onToggle={emoji => onToggleReaction(id, emoji)}
      />
      <div class='shoutbox-message-date' title={new Date(date).toLocaleString()}>
        {formatRelativeTime(date)}
      </div>
    </div>
  </div>
)

export const ShoutboxSection: FC = () => {
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [messages, setMessages] = useState<ShoutboxMessageType[]>([])
  const [availableReactions, setAvailableReactions] = useState<string[]>([])

  const setReplyTarget = useSetAtom(replyTarget$atom)

  const { addNotification } = useNotifications()

  const handleReply = useCallback((id: string, text: string) => {
    const quote = buildQuote(text)
    const preview = quote.replace(/\s+/g, ' ').trim()

    setReplyTarget({ id, quote, preview })

    if (typeof window !== 'undefined') {
      document.getElementById('letterbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [setReplyTarget])

  const fetchShoutbox = async (page = 0) => {
    const response = await fetch(`${API_URL}/api/shoutbox?page=${page}`, {
      headers: { 'X-Fingerprint': getFingerprint() }
    })

    const json = await response.json() as Record<string, any>

    if (!json.ok) {
      return addNotification('failed to fetch shoutbox!', NotificationType.Error)
    }

    const data = json.data.items as ShoutboxMessageType[]

    setPage(json.data.page)
    setTotalPages(Math.max(1, json.data.totalPages ?? 1))
    setMessages(data)
    setAvailableReactions(json.data.availableReactions ?? [])
  }

  const toggleReaction = useCallback(async (id: string, emoji: string) => {
    let snapshot: ShoutboxMessageType | undefined

    setMessages(prev => prev.map(m => {
      if (m.id !== id) return m

      snapshot = m

      const previous = m.yourReactions ?? []
      const togglingOff = previous.includes(emoji)
      const nextReactions = { ...(m.reactions ?? {}) }

      for (const prev of previous) {
        const count = Math.max(0, (nextReactions[prev] ?? 0) - 1)

        if (count === 0) {
          delete nextReactions[prev]
        } else {
          nextReactions[prev] = count
        }
      }

      if (!togglingOff) {
        nextReactions[emoji] = (nextReactions[emoji] ?? 0) + 1
      }

      return {
        ...m,
        reactions: nextReactions,
        yourReactions: togglingOff ? [] : [emoji]
      }
    }))

    try {
      const response = await fetch(`${API_URL}/api/shoutbox/${id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fingerprint': getFingerprint()
        },
        body: JSON.stringify({ emoji })
      })

      const json = await response.json() as Record<string, any>

      if (!json.ok) {
        throw new Error(json.error ?? 'failed')
      }

      // reconcile with server truth
      setMessages(prev => prev.map(m => m.id === id ? {
        ...m,
        reactions: json.data.reactions,
        yourReactions: json.data.yourReactions
      } : m))
    } catch {
      // revert on failure
      if (snapshot !== undefined) {
        setMessages(prev => prev.map(m => m.id === id ? snapshot! : m))
      }

      addNotification('failed to send reaction', NotificationType.Error)
    }
  }, [addNotification])

  useEffect(() => { fetchShoutbox() }, [])
  useInterval(() => fetchShoutbox(page), 15_000, [page])

  return (
    <section id='shoutbox'>
      {messages.length === 0 ? (
        <div class='centered'>
          <p>no messages here, unfortunately</p>
          <p>maybe your message will be the first one here?</p>
        </div>
      ) : (
        <>
          <div class='shoutbox-container'>
            {messages.map(message => (
              <ShoutboxMessage
                key={message.id}
                {...message}
                availableReactions={availableReactions}
                onToggleReaction={toggleReaction}
                onReply={handleReply}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div class='shoutbox-pagination'>
              <CoolButton text='<' disabled={page === 0} onClick={() => fetchShoutbox(page - 1)} />
              <span class='shoutbox-pagination-status'>{page + 1} / {totalPages}</span>
              <CoolButton text='>' disabled={page + 1 >= totalPages} onClick={() => fetchShoutbox(page + 1)} />
            </div>
          )}
        </>
      )}
    </section>
  )
}
