import { useEffect, useMemo, useRef, useState, type FC } from 'preact/compat'
import { useAtom } from 'jotai'

import * as Icons from '@starkow.dev/icons'

import { CoolButton, RichEditor } from '../../components'
import type { Content } from '../../components/RichContent/types'
import { useNotifications } from '../../hooks'
import { NotificationType } from '../../types'
import { API_URL, getFingerprint } from '../../shared'
import { replyTarget$atom } from '../../state'

import './style.css'

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

const DRAFT_KEY = 'starkow:letterbox-draft'

interface Draft {
  html: string
  plain: string
}

const loadDraft = (): Draft => {
  if (typeof window === 'undefined') {
    return { html: '', plain: '' }
  }

  try {
    const raw = localStorage.getItem(DRAFT_KEY)

    if (raw === null) return { html: '', plain: '' }

    const parsed = JSON.parse(raw) as Partial<Draft>

    return { html: parsed.html ?? '', plain: parsed.plain ?? '' }
  } catch {
    return { html: '', plain: '' }
  }
}

const saveDraft = (draft: Draft) => {
  if (typeof window === 'undefined') return

  try {
    if (draft.plain === '') {
      localStorage.removeItem(DRAFT_KEY)
    } else {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  } catch {
    // ignore
  }
}

const MAX_LENGTH = 1024

export const LetterboxSection: FC<LetterboxSectionProps> = ({}) => {
  const placeholder = useMemo(() => getRandomElement(placeholders), [])

  const initialDraft = useMemo(loadDraft, [])

  const [plainText, setPlainText] = useState(initialDraft.plain)
  const [html, setHtml] = useState(initialDraft.html)
  const [content, setContent] = useState<Content[]>([])
  const [isLoading, setLoading] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)
  const [replyTarget, setReplyTarget] = useAtom(replyTarget$atom)

  const draftTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (draftTimeout.current !== null) {
      clearTimeout(draftTimeout.current)
    }

    draftTimeout.current = setTimeout(() => saveDraft({ html, plain: plainText }), 300)

    return () => {
      if (draftTimeout.current !== null) {
        clearTimeout(draftTimeout.current)
      }
    }
  }, [plainText, html])

  const { addNotification } = useNotifications()

  const currentLength = plainText.length
  const remaining = MAX_LENGTH - currentLength
  const isDisabled = currentLength === 0 || currentLength > MAX_LENGTH

  const notify = async () => {
    if (isDisabled || isLoading) return

    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        message: plainText,
        placeholder,
        content
      }

      if (replyTarget !== null) {
        body.replyTo = { id: replyTarget.id, quote: replyTarget.quote }
      }

      const response = await fetch(`${API_URL}/api/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fingerprint': getFingerprint()
        },
        body: JSON.stringify(body)
      })

      const json = await response.json()

      setLoading(false)

      if (!json.ok) {
        addNotification('failed to send message through the letterbox: ' + json.error, NotificationType.Error)
      } else {
        setPlainText('')
        setHtml('')
        setContent([])
        setResetSignal(prev => prev + 1)
        saveDraft({ html: '', plain: '' })
        setReplyTarget(null)
        addNotification('message has been successfully sent!', NotificationType.Success)
      }
    } catch (error) {
      return console.error(error)
    }
  }

  return (
    <section id='letterbox'>
      {replyTarget !== null && (
        <div class='letterbox-reply'>
          <div class='letterbox-reply-body'>
            <div class='letterbox-reply-label'>replying to</div>
            <div class='letterbox-reply-preview'>{replyTarget.preview}</div>
          </div>
          <button
            type='button'
            class='letterbox-reply-cancel'
            onClick={() => setReplyTarget(null)}
            aria-label='cancel reply'
          >×</button>
        </div>
      )}
      <div class='letterbox-container'>
        <RichEditor
          initialHtml={initialDraft.html}
          resetSignal={resetSignal}
          placeholder={placeholder}
          disabled={isLoading}
          onChange={({ content: nextContent, plain, html: nextHtml }) => {
            setPlainText(plain)
            setHtml(nextHtml)
            setContent(nextContent)
          }}
          onSubmit={notify}
        />
        <CoolButton
          icon={isLoading ? Icons.IconLoaderX : Icons.IconSend}
          onClick={notify}
          disabled={isLoading || isDisabled}
        />
      </div>

      <div
        class='letterbox-counter text-small'
        data-state={remaining < 0 ? 'over' : remaining < 100 ? 'warn' : 'ok'}
      >
        {currentLength} / {MAX_LENGTH}
      </div>
    </section>
  )
}
