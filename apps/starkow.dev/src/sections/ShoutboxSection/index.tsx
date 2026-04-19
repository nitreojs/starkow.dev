import { FC, useCallback, useEffect, useState } from 'preact/compat'
import { useAtomValue, useSetAtom } from 'jotai'
import clsx from 'clsx'

import { CoolButton, RichContent, RichEditor } from '../../components'
import type { Content } from '../../components/RichContent/types'
import { API_URL, autoLinkify, contentToHtml, formatRelativeTime, getFingerprint } from '../../shared'
import { adminKey$atom, replyTarget$atom } from '../../state'
import { ShoutboxAnswer, ShoutboxMessage as ShoutboxMessageType } from './types'
import { AdminMenu, AdminMenuItem } from './AdminMenu'
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
  onAddAnswer: (id: string, content: Content[]) => Promise<boolean>
  onEditAnswer: (id: string, index: number, content: Content[]) => Promise<boolean>
  onDeleteAnswer: (id: string, index: number) => void
  onSetReplyTo: (id: string, replyTo: { id: string, quote: string } | null) => void
  onEditMessage: (id: string, text: string, content: Content[]) => Promise<boolean>
  onSetAdminPosted: (id: string, adminPosted: boolean) => void
}

interface ShoutboxMessageProps extends ShoutboxMessageType {
  availableReactions: string[]
  onToggleReaction: (id: string, emoji: string) => void
  onReply: (id: string, text: string) => void
  admin: AdminHandlers | null
  attachingTargetId: string | null
  onBeginAttach: (id: string) => void
  onCancelAttach: () => void
  onPickAsQuoteSource: (sourceId: string, sourceText: string) => void
  onQuoteClick: (targetId: string) => void
}

const ANSWER_INDENT_CAP = 4

interface AnswerEditorProps {
  initialContent: Content[]
  onSave: (content: Content[]) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
}

const AnswerEditor: FC<AnswerEditorProps> = ({ initialContent, onSave, onCancel, submitLabel = 'save' }) => {
  const [content, setContent] = useState<Content[]>(initialContent)
  const [plain, setPlain] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)

  const initialHtml = useState(() => contentToHtml(initialContent))[0]

  const submit = async () => {
    if (plain.trim() === '' || busy) {
      return
    }

    setBusy(true)

    const ok = await onSave(content)

    setBusy(false)

    if (ok) {
      setContent([])
      setPlain('')
      setResetSignal(prev => prev + 1)
    }
  }

  return (
    <div class='shoutbox-admin-editor'>
      <RichEditor
        initialHtml={initialHtml}
        resetSignal={resetSignal}
        placeholder='answer...'
        disabled={busy}
        onChange={({ content: next, plain: nextPlain }) => {
          setContent(next)
          setPlain(nextPlain)
        }}
        onSubmit={submit}
      />
      <div class='shoutbox-admin-editor-actions'>
        <button type='button' class='shoutbox-admin-action' onClick={submit} disabled={busy || plain.trim() === ''}>
          [{busy ? '...' : submitLabel}]
        </button>
        <button type='button' class='shoutbox-admin-action' onClick={onCancel} disabled={busy}>
          [cancel]
        </button>
      </div>
    </div>
  )
}

interface MessageTextEditorProps {
  initialText: string
  initialContent: Content[] | undefined
  onSave: (text: string, content: Content[]) => Promise<boolean>
  onCancel: () => void
}

const MessageTextEditor: FC<MessageTextEditorProps> = ({ initialText, initialContent, onSave, onCancel }) => {
  const seed = initialContent !== undefined && initialContent.length > 0 ? initialContent : autoLinkify(initialText)
  const [content, setContent] = useState<Content[]>(seed)
  const [plain, setPlain] = useState(initialText)
  const [busy, setBusy] = useState(false)

  const initialHtml = useState(() => contentToHtml(seed))[0]

  const submit = async () => {
    if (plain.trim() === '' || busy) {
      return
    }

    setBusy(true)

    const ok = await onSave(plain, content)

    setBusy(false)

    if (ok) {
      onCancel()
    }
  }

  return (
    <div class='shoutbox-admin-editor'>
      <RichEditor
        initialHtml={initialHtml}
        placeholder='edit message...'
        disabled={busy}
        onChange={({ content: next, plain: nextPlain }) => {
          setContent(next)
          setPlain(nextPlain)
        }}
        onSubmit={submit}
      />
      <div class='shoutbox-admin-editor-actions'>
        <button type='button' class='shoutbox-admin-action' onClick={submit} disabled={busy || plain.trim() === ''}>
          [{busy ? '...' : 'save'}]
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

  const handleSave = async (next: Content[]): Promise<boolean> => {
    if (admin === null) {
      return false
    }

    const ok = await admin.onEditAnswer(messageId, index, next)

    if (ok) {
      onEndEdit()
    }

    return ok
  }

  return (
    <div class={clsx('shoutbox-answer', flatten && 'shoutbox-answer-flat')}>
      {isEditing ? (
        <AnswerEditor
          initialContent={content}
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

const ShoutboxMessage: FC<ShoutboxMessageProps> = ({ id, text, content, date, pinned, replyTo, answers, reactions, yourReactions, adminPosted, availableReactions, onToggleReaction, onReply, admin, attachingTargetId, onBeginAttach, onCancelAttach, onPickAsQuoteSource, onQuoteClick }) => {
  const [editingAnswerIndex, setEditingAnswerIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingText, setIsEditingText] = useState(false)

  const handleAddAnswer = async (next: Content[]): Promise<boolean> => {
    if (admin === null) {
      return false
    }

    const ok = await admin.onAddAnswer(id, next)

    if (ok) {
      setIsAdding(false)
    }

    return ok
  }

  const answerCount = answers?.length ?? 0

  const adminMenuItems: AdminMenuItem[] = []

  if (admin !== null) {
    adminMenuItems.push({
      label: '[edit text]',
      onClick: () => setIsEditingText(true)
    })

    adminMenuItems.push({
      label: pinned ? '[unpin]' : '[pin]',
      onClick: () => admin.onSetPinned(id, !pinned)
    })

    adminMenuItems.push({
      label: adminPosted ? '[unmark as admin]' : '[mark as admin]',
      onClick: () => admin.onSetAdminPosted(id, !adminPosted)
    })

    if (!replyTo && attachingTargetId === null) {
      adminMenuItems.push({
        label: '[attach quote]',
        onClick: () => onBeginAttach(id)
      })
    }

    if (attachingTargetId === id) {
      adminMenuItems.push({
        label: '[cancel attach]',
        onClick: onCancelAttach,
        danger: true
      })
    }

    if (attachingTargetId !== null && attachingTargetId !== id) {
      adminMenuItems.push({
        label: '[select]',
        onClick: () => onPickAsQuoteSource(id, text),
        highlight: true
      })
    }

    if (replyTo) {
      adminMenuItems.push({
        label: '[remove quote]',
        onClick: () => admin.onSetReplyTo(id, null),
        danger: true
      })
    }

    adminMenuItems.push({
      label: '[delete]',
      onClick: () => admin.onDeleteMessage(id),
      danger: true
    })
  }

  return (
    <div class={clsx('shoutbox-message', pinned && 'shoutbox-message-pinned', admin !== null && 'shoutbox-message-admin')} id={`shoutbox-${id}`}>
      <div class='shoutbox-message-actions'>
        {!pinned && (
          <button type='button' class='shoutbox-message-reply' onClick={() => onReply(id, text)}>
            [reply]
          </button>
        )}
        <AdminMenu items={adminMenuItems} />
      </div>
      {pinned && (
        <div class='shoutbox-message-pin'>📌 pinned</div>
      )}
      {replyTo && (
        <a
          class='shoutbox-message-quote'
          href={`#shoutbox-${replyTo.id}`}
          onClick={event => {
            event.preventDefault()
            onQuoteClick(replyTo.id)
          }}
        >
          <span class='shoutbox-message-quote-text'>{replyTo.quote}</span>
        </a>
      )}
      {isEditingText && admin !== null ? (
        <MessageTextEditor
          initialText={text}
          initialContent={content}
          onSave={async (nextText, nextContent) => admin.onEditMessage(id, nextText, nextContent)}
          onCancel={() => setIsEditingText(false)}
        />
      ) : (
        <div class='shoutbox-message-text'>
          <RichContent content={content !== undefined && content.length > 0 ? content : autoLinkify(text)} />
        </div>
      )}
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
              initialContent={[]}
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
        <div class='shoutbox-message-meta-right'>
          {adminPosted && (
            <>
              <span class='shoutbox-message-admin-badge'>admin</span>
              <span class='shoutbox-message-meta-sep'>•</span>
            </>
          )}
          <div class='shoutbox-message-date' title={new Date(date).toLocaleString()}>
            {formatRelativeTime(date)}
          </div>
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

  const [attachingTargetId, setAttachingTargetId] = useState<string | null>(null)

  const { addNotification } = useNotifications()

  const handleReply = useCallback((id: string, text: string) => {
    const quote = buildQuote(text)
    const preview = quote.replace(/\s+/g, ' ').trim()

    setReplyTarget({ id, quote, preview })

    if (typeof window !== 'undefined') {
      document.getElementById('letterbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [setReplyTarget])

  const highlightMessage = (targetId: string) => {
    const el = document.getElementById(`shoutbox-${targetId}`)

    if (el === null) {
      return false
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('shoutbox-message-flash')
    void el.offsetWidth
    el.classList.add('shoutbox-message-flash')
    window.setTimeout(() => el.classList.remove('shoutbox-message-flash'), 1600)

    return true
  }

  const handleQuoteClick = async (targetId: string) => {
    if (highlightMessage(targetId)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/shoutbox/locate/${targetId}`, {
        headers: { 'X-Fingerprint': getFingerprint() }
      })

      const json = await response.json() as Record<string, any>

      if (!json.ok) {
        addNotification('quoted message not found', NotificationType.Error)

        return
      }

      await fetchShoutbox(json.data.page)

      requestAnimationFrame(() => requestAnimationFrame(() => highlightMessage(targetId)))
    } catch {
      addNotification('failed to locate quoted message', NotificationType.Error)
    }
  }

  const handlePickAsQuoteSource = (sourceId: string, sourceText: string) => {
    if (attachingTargetId === null) {
      return
    }

    const quote = buildQuote(sourceText)

    adminHandlers?.onSetReplyTo(attachingTargetId, { id: sourceId, quote })
    setAttachingTargetId(null)
  }

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
    onAddAnswer: async (id, content) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ content })
      })

      if (ok) {
        fetchShoutbox(page)
      }

      return ok
    },
    onEditAnswer: async (id, index, content) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/answers/${index}`, {
        method: 'PATCH',
        body: JSON.stringify({ content })
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
    },
    onSetReplyTo: async (id, replyTo) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/reply`, {
        method: 'PATCH',
        body: JSON.stringify({ replyTo })
      })

      if (ok) {
        if (replyTo !== null) {
          setReplyTarget(null)
        }

        fetchShoutbox(page)
      }
    },
    onEditMessage: async (id, text, content) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/text`, {
        method: 'PATCH',
        body: JSON.stringify({ text, content })
      })

      if (ok) {
        fetchShoutbox(page)
      }

      return ok
    },
    onSetAdminPosted: async (id, adminPosted) => {
      const ok = await adminRequest(`/api/shoutbox/${id}/admin-posted`, {
        method: 'POST',
        body: JSON.stringify({ adminPosted })
      })

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
                attachingTargetId={attachingTargetId}
                onBeginAttach={setAttachingTargetId}
                onCancelAttach={() => setAttachingTargetId(null)}
                onPickAsQuoteSource={handlePickAsQuoteSource}
                onQuoteClick={handleQuoteClick}
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
