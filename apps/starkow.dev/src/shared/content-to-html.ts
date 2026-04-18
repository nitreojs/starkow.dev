import type { Content } from '../components/RichContent/types'

const escape = (raw: string): string =>
  raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const wrap: Record<string, string> = {
  bold: 'b',
  italic: 'i',
  code: 'code',
  strike: 's',
  underline: 'u'
}

const nodeToHtml = (node: Content): string => {
  if (typeof node === 'string') {
    return escape(node)
  }

  if (node.type === 'br') {
    return '<br>'
  }

  if (node.type === 'link') {
    return `<a href="${escape(node.href)}">${node.children.map(nodeToHtml).join('')}</a>`
  }

  const tag = wrap[node.type]

  if (tag !== undefined) {
    return `<${tag}>${node.children.map(nodeToHtml).join('')}</${tag}>`
  }

  // highlight / muted and anything the editor does not round-trip: keep the text
  if ('children' in node) {
    return node.children.map(nodeToHtml).join('')
  }

  return ''
}

export const contentToHtml = (content: Content[]): string =>
  content.map(nodeToHtml).join('')
