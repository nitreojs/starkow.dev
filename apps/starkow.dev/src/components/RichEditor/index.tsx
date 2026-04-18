import { useCallback, useEffect, useRef, type FC } from 'preact/compat'

import type { Content } from '../RichContent/types'

import { flattenToText, serializeEditor } from './serialize'

import './style.css'

interface RichEditorProps {
  initialHtml?: string
  resetSignal?: number
  placeholder?: string
  disabled?: boolean
  onChange: (payload: { content: Content[], plain: string, html: string }) => void
  onSubmit?: () => void
}

type FormatCommand = 'bold' | 'italic' | 'underline' | 'strikeThrough'

const commandIcon: Record<FormatCommand | 'code' | 'link', string> = {
  bold: 'B',
  italic: 'I',
  underline: 'U',
  strikeThrough: 'S',
  code: '{ }',
  link: '🔗'
}

const wrapSelection = (tagName: string) => {
  const selection = window.getSelection()

  if (selection === null || selection.rangeCount === 0) {
    return
  }

  const range = selection.getRangeAt(0)

  if (range.collapsed) {
    return
  }

  const wrapper = document.createElement(tagName)

  try {
    wrapper.appendChild(range.extractContents())
    range.insertNode(wrapper)

    selection.removeAllRanges()

    const newRange = document.createRange()

    newRange.selectNodeContents(wrapper)
    selection.addRange(newRange)
  } catch {
    // selection spanned across block boundaries; ignore
  }
}

const applyLink = () => {
  const selection = window.getSelection()

  if (selection === null || selection.rangeCount === 0 || selection.toString() === '') {
    return
  }

  const input = window.prompt('url:')

  if (input === null || input === '') {
    return
  }

  const href = /^https?:\/\//.test(input) ? input : `https://${input}`

  document.execCommand('createLink', false, href)
}

export const RichEditor: FC<RichEditorProps> = ({ initialHtml = '', resetSignal, placeholder, disabled, onChange, onSubmit }) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const hydrated = useRef(false)
  const lastReset = useRef(resetSignal)

  const emit = useCallback(() => {
    const node = editorRef.current

    if (node === null) {
      return
    }

    const content = serializeEditor(node)
    const plain = flattenToText(content)
    const html = node.innerHTML

    onChange({ content, plain, html })
  }, [onChange])

  useEffect(() => {
    const node = editorRef.current

    if (node === null || hydrated.current) {
      return
    }

    hydrated.current = true

    if (initialHtml !== '') {
      node.innerHTML = initialHtml
    }

    emit()
  }, [initialHtml, emit])

  useEffect(() => {
    if (resetSignal === lastReset.current) {
      return
    }

    lastReset.current = resetSignal

    const node = editorRef.current

    if (node === null) {
      return
    }

    node.innerHTML = ''
    emit()
  }, [resetSignal, emit])

  const handleCommand = (command: FormatCommand) => (event: Event) => {
    event.preventDefault()

    document.execCommand(command)

    editorRef.current?.focus()
    emit()
  }

  const handleCode = (event: Event) => {
    event.preventDefault()

    wrapSelection('code')

    editorRef.current?.focus()
    emit()
  }

  const handleLink = (event: Event) => {
    event.preventDefault()

    applyLink()

    editorRef.current?.focus()
    emit()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      onSubmit?.()

      return
    }

    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
      const key = event.key.toLowerCase()

      if (key === 'b') {
        event.preventDefault()
        document.execCommand('bold')
        emit()

        return
      }

      if (key === 'i') {
        event.preventDefault()
        document.execCommand('italic')
        emit()

        return
      }

      if (key === 'u') {
        event.preventDefault()
        document.execCommand('underline')
        emit()

        return
      }
    }
  }

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault()

    const text = event.clipboardData?.getData('text/plain') ?? ''

    document.execCommand('insertText', false, text)

    emit()
  }

  return (
    <div class='rich-editor'>
      <div class='rich-editor-toolbar'>
        <button type='button' class='rich-editor-tool' onMouseDown={handleCommand('bold')} title='bold (ctrl/⌘ + b)'>
          <b>{commandIcon.bold}</b>
        </button>
        <button type='button' class='rich-editor-tool' onMouseDown={handleCommand('italic')} title='italic (ctrl/⌘ + i)'>
          <i>{commandIcon.italic}</i>
        </button>
        <button type='button' class='rich-editor-tool' onMouseDown={handleCommand('underline')} title='underline (ctrl/⌘ + u)'>
          <u>{commandIcon.underline}</u>
        </button>
        <button type='button' class='rich-editor-tool' onMouseDown={handleCommand('strikeThrough')} title='strikethrough'>
          <s>{commandIcon.strikeThrough}</s>
        </button>
        <button type='button' class='rich-editor-tool' onMouseDown={handleCode} title='code'>
          <code>{commandIcon.code}</code>
        </button>
        <button type='button' class='rich-editor-tool' onMouseDown={handleLink} title='link'>
          {commandIcon.link}
        </button>
      </div>
      <div
        ref={editorRef}
        class='rich-editor-surface'
        contentEditable={!disabled}
        data-placeholder={placeholder}
        onInput={emit}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    </div>
  )
}
