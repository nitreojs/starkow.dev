import { FC, useCallback, useEffect, useState } from 'preact/compat'
import { useAtomValue, useSetAtom } from 'jotai'
import clsx from 'clsx'

import { CoolButton, RichContent } from '../../components'
import { flattenToText } from '../../components/RichEditor/serialize'
import { API_URL, autoLinkify, formatRelativeTime, getFingerprint } from '../../shared'
import { adminKey$atom, replyTarget$atom } from '../../state'
import { ShoutboxAnswer, ShoutboxMessage as ShoutboxMessageType } from './types'
import { Reactions } from './Reactions'
import { useInterval } from '@starkow.dev/hooks'
import { useNotifications } from '../../hooks'
import { NotificationType } from '../../types'

import './style.css'

const QUOTE_LIMIT = 120

const buildQuote = (text: string): string =>
  text.length > QUOTE_LIMIT ? text.slice(0, QUOTE_LIMIT) : text

interface AdminHandlers {
  onDeleteMessage: (id: string) => void
  onSetPinned: (id: string, pinned: boolean) => void
  onAddAnswer: (id: string, text: string) => Promise<boolean>
  onEditAnswer: (id: string, index: number, text: string) => Promise<boolean>
  onDeleteAnswer: (id: string, index: number) => void
}

interface ShoutboxMessageProps extends ShoutboxMessageType {
  availableReactions: string[]
  onToggleReaction: (id: string, emoji: string) => void
  onReply: (id: string, text: string) => void
  admin: AdminHandlers | null
}

const ANSWER_INDENT_CAP = 4

interface AnswerEditorProps {
  initialText: string
  onSave: (text: string) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
}

const AnswerEditor: FC<AnswerEditorProps> = ({ initialText, onSave, onCancel, submitLabel = 'save' }) => {
  const [text, setText] = useState(initialText)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const trimmed = text.trim()

    if (trimmed === '' || busy) {
      return
    }

    setBusy(true)

    const ok = await onSave(trimmed)

    setBusy(false)

    if (ok) {
      setText('')
    }
  }

  return (
    <div class='shoutbox-admin-editor'>
      <textarea
        class='shoutbox-admin-textarea'
        value={text}
        disabled={busy}
        onInput={e => setText((e.currentTarget as HTMLTextAreaElement).value)}
        placeholder='answer text...'
      />
      <div class='shoutbox-admin-editor-actions'>
        <button type='button' class='shoutbox-admin-action' onClick={submit} disabled={busy || text.trim() === ''}>
          [{busy ? '...' : submitLabel}]
        </button>
        <button type='button' class='shoutbox-admin-action' onClick={onCancel} disabled={busy}>
          [cancel]
        </button>
      </div>
    </div>
  )
}

interface AnswerTreeProps {
  answers: ShoutboxAnswer[]
  messageId: string
  admin: AdminHandlers | null
  editingIndex: number | null
  onBeginEdit: (index: number) => void
  onEndEdit: () => void
  index?: number
}

const AnswerTree: FC<AnswerTreeProps> = ({ answers, messageId, admin, editingIndex, onBeginEdit, onEndEdit, index = 0 }) => {
  if (index >= answers.length) {
    return null
  }

  const { content, date } = answers[index]
  const flatten = index >= ANSWER_INDENT_CAP
  const isEditing = editingIndex === index

  const handleSave = async (text: string): Promise<boolean> => {
    if (admin === null) {
      return false
    }

    const ok = await admin.onEditAnswer(messageId, index, text)

    if (ok) {
      onEndEdit()
    }

    return ok
  }

  return (
    <div class={clsx('shoutbox-answer', flatten && 'shoutbox-answer-flat')}>
      {isEditing ? (
        <AnswerEditor
          initialText={flattenToText(content)}
          onSave={handleSave}
          onCancel={onEndEdit}
        />
      ) : (
        <>
          <div class='shoutbox-answer-content'>
            <RichContent content={content} />
          </div>
          <div class='shoutbox-answer-meta'>
            <div class='shoutbox-answer-date' title={new Date(date).toLocaleString()}>
              {formatRelativeTime(date)}
            </div>
            {admin !== null && (
              <div class='shoutbox-admin-inline'>
                <button type='button' class='shoutbox-admin-action' onClick={() => onBeginEdit(index)}>
                  [edit]
                </button>
                <button
                  type='button'
                  class='shoutbox-admin-action shoutbox-admin-action-danger'
                  onClick={() => admin.onDeleteAnswer(messageId, index)}
                >
                  [delete]
                </button>
              </div>
            )}
          </div>
        </>
      )}
      <AnswerTree
        answers={answers}
        messageId={messageId}
        admin={admin}
        editingIndex={editingIndex}
        onBeginEdit={onBeginEdit}
        onEndEdit={onEndEdit}
        index={index + 1}
      />
    </div>
  )
}

const ShoutboxMessage: FC<ShoutboxMessageProps> = ({ id, text, content, date, pinned, replyTo, answers, reactions, yourReactions, availableReactions, onToggleReaction, onReply, admin }) => {
  const [editingAnswerIndex, setEditingAnswerIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddAnswer = async (text: string): Promise<boolean> => {
    if (admin === null) {
      return false
    }

    const ok = await admin.onAddAnswer(id, text)

    if (ok) {
      setIsAdding(false)
    }

    return ok
  }

  const answerCount = answers?.length ?? 0

  return (
    <div class={clsx('shoutbox-message', pinned && 'shoutbox-message-pinned', admin !== null && 'shoutbox-message-admin')} id={`shoutbox-${id}`}>
      <div class='shoutbox-message-actions'>
        {!pinned && (
          <button type='button' class='shoutbox-message-reply' onClick={() => onReply(id, text)}>
            [reply]
          </button>
        )}
        {admin !== null && (
          <>
            <button
              type='button'
              class='shoutbox-message-reply'
              onClick={() => admin.onSetPinned(id, !pinned)}
            >
              [{pinned ? 'unpin' : 'pin'}]
            </button>
            <button
              type='button'
              class='shoutbox-message-reply shoutbox-admin-action-danger'
              onClick={() => admin.onDeleteMessage(id)}
            >
              [delete]
            </button>
          </>
        )}
      </div>
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
      {answerCount > 0 && (
        <AnswerTree
          answers={answers!}
          messageId={id}
          admin={admin}
          editingIndex={editingAnswerIndex}
          onBeginEdit={setEditingAnswerIndex}
          onEndEdit={() => setEditingAnswerIndex(null)}
        />
      )}
      {admin !== null && (
        <div class='shoutbox-admin-add-answer'>
          {isAdding ? (
            <AnswerEditor
              initialText=''
              onSave={handleAddAnswer}
              onCancel={() => setIsAdding(false)}
              submitLabel='add answer'
            />
          ) : (
            <button type='button' class='shoutbox-admin-action' onClick={() => setIsAdding(true)}>
              [+ add answer]
            </button>
          )}
        </div>
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
}

export const ShoutboxSection: FC = () => {
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [messages, setMessages] = useState<ShoutboxMessageType[]>([])
  const [availableReactions, setAvailableReactions] = useState<string[]>([])

  const setReplyTarget = useSetAtom(replyTarget$atom)
  const adminKey = useAtomValue(adminKey$atom)

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
      if (m.id !== id) {
        return m
      }

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

  const adminRequest = useCallback(async (path: string, init: RequestInit): Promise<boolean> => {
    if (adminKey === null) {
      return false
    }

    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
          ...(init.headers ?? {})
        }
      })

      const json = await response.json() as Record<string, any>

      if (!json.ok) {
        addNotification(`admin: ${json.error ?? 'failed'}`, NotificationType.Error)

        return false
      }

      return true
    } catch {
      addNotification('admin: request failed', NotificationType.Error)

      return false
    }
  }, [adminKey, addNotification])

  const adminHandlers: AdminHandlers | null = adminKey === null ? null : {
    onDeleteMessage: async (id) => {
      if (!window.confirm('delete this message?')) {
        return
      }

      const ok = await adminRequest(`/api/shoutbox/${id}`, { method: 'DELETE' })

      if (ok) {
        fetchShoutbox(page)
      }
    },
    onSetPinned: async (id, pinned) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/pin`, {
        method: 'POST',
        body: JSON.stringify({ pinned })
      })

      if (ok) {
        fetchShoutbox(page)
      }
    },
    onAddAnswer: async (id, text) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ content: autoLinkify(text) })
      })

      if (ok) {
        fetchShoutbox(page)
      }

      return ok
    },
    onEditAnswer: async (id, index, text) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/answers/${index}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: autoLinkify(text) })
      })

      if (ok) {
        fetchShoutbox(page)
      }

      return ok
    },
    onDeleteAnswer: async (id, index) => {
      if (!window.confirm('delete this answer?')) {
        return
      }

      const ok = await adminRequest(`/api/shoutbox/${id}/answers/${index}`, { method: 'DELETE' })

      if (ok) {
        fetchShoutbox(page)
      }
    }
  }

  useEffect(() => {
    fetchShoutbox()
  }, [])
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
            {[
              ...messages.filter(m => m.pinned),
              ...messages.filter(m => !m.pinned).reverse()
            ].map(message => (
              <ShoutboxMessage
                key={message.id}
                {...message}
                availableReactions={availableReactions}
                onToggleReaction={toggleReaction}
                onReply={handleReply}
                admin={adminHandlers}
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
