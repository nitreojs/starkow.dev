import type { Content } from '../components/RichContent/types'

const URL_PATTERN = /https?:\/\/[^\s<>()]+[^\s<>().,!?:;"']/g

export const autoLinkify = (text: string): Content[] => {
  const nodes: Content[] = []

  let lastIndex = 0

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0
    const url = match[0]

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start))
    }

    nodes.push({ type: 'link', href: url, children: [url] })

    lastIndex = start + url.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length === 0 ? [text] : nodes
}
