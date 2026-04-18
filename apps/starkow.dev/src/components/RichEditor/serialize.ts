import type { Content } from '../RichContent/types'

const tagToType: Record<string, 'bold' | 'italic' | 'code' | 'strike' | 'underline'> = {
  'B': 'bold',
  'STRONG': 'bold',
  'I': 'italic',
  'EM': 'italic',
  'CODE': 'code',
  'S': 'strike',
  'STRIKE': 'strike',
  'DEL': 'strike',
  'U': 'underline'
}

const walkChildren = (node: Node): Content[] => {
  const out: Content[] = []

  node.childNodes.forEach(child => {
    out.push(...serializeNode(child))
  })

  return out
}

const serializeNode = (node: Node): Content[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ''

    return text === '' ? [] : [text]
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return []
  }

  const el = node as HTMLElement
  const tag = el.tagName

  if (tag === 'BR') {
    return [{ type: 'br' }]
  }

  if (tag === 'A') {
    const href = el.getAttribute('href') ?? ''

    if (href === '') {
      return walkChildren(el)
    }

    return [{ type: 'link', href, children: walkChildren(el) }]
  }

  const wrapType = tagToType[tag]

  if (wrapType !== undefined) {
    return [{ type: wrapType, children: walkChildren(el) } as Content]
  }

  // block elements (DIV, P): flatten with a line break
  if (tag === 'DIV' || tag === 'P') {
    const inner = walkChildren(el)

    // first div after another content doesn't need a leading break in theory,
    // but contenteditable produces one per visual line, so emit <br> prefix
    // for every such block except when it's the first child overall
    const isFirst = el.parentNode !== null && el.parentNode.firstChild === el

    return isFirst ? inner : [{ type: 'br' }, ...inner]
  }

  // fallback: unwrap
  return walkChildren(el)
}

export const serializeEditor = (root: HTMLElement): Content[] => {
  const raw = walkChildren(root)

  return collapseTrailing(raw)
}

const collapseTrailing = (nodes: Content[]): Content[] => {
  const end = nodes.length

  let last = end

  while (last > 0) {
    const node = nodes[last - 1]

    if (typeof node === 'object' && 'type' in node && node.type === 'br') {
      last--
      continue
    }

    if (typeof node === 'string' && node.trim() === '') {
      last--
      continue
    }

    break
  }

  return nodes.slice(0, last)
}

export const flattenToText = (content: Content[]): string => {
  const parts: string[] = []

  for (const node of content) {
    if (typeof node === 'string') {
      parts.push(node)
      continue
    }

    if (node.type === 'br') {
      parts.push('\n')
      continue
    }

    parts.push(flattenToText(node.children))
  }

  return parts.join('')
}
