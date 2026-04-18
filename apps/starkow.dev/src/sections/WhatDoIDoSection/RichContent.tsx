import { FC, Fragment } from 'preact/compat'

import type { Content } from './types'

interface RichContentProps {
  content: Content[]
}

export const RichContent: FC<RichContentProps> = ({ content }) => (
  <>
    {
      content.map((node, i) => <RichNode key={i} node={node} />)
    }
  </>
)

const RichNode: FC<{ node: Content }> = ({ node }) => {
  if (typeof node === 'string') {
    return <Fragment>{ node }</Fragment>
  }

  switch (node.type) {
    case 'bold':
      return <b><RichContent content={node.children} /></b>

    case 'italic':
      return <i><RichContent content={node.children} /></i>

    case 'code':
      return <code><RichContent content={node.children} /></code>

    case 'strike':
      return <s><RichContent content={node.children} /></s>

    case 'underline':
      return <u><RichContent content={node.children} /></u>

    case 'highlight':
      return <mark><RichContent content={node.children} /></mark>

    case 'muted':
      return (
        <span class='rich-muted'>
          <RichContent content={node.children} />
        </span>
      )

    case 'link':
      return (
        <a
          class='rich-link'
          href={node.href}
          target='_blank'
          rel='noopener noreferrer'
          onClick={(e) => e.stopPropagation()}
        >
          <RichContent content={node.children} />
        </a>
      )

    case 'br':
      return <br />

    default:
      return null
  }
}
