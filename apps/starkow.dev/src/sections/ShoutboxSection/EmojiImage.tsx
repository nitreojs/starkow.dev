import { FC } from 'preact/compat'
import { useState } from 'preact/hooks'

import { emojiToSlug } from './emoji-slug'

interface EmojiImageProps {
  emoji: string
  class?: string
}

export const EmojiImage: FC<EmojiImageProps> = ({ emoji, class: className }) => {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span class={className}>{emoji}</span>
  }

  return (
    <img
      class={className}
      src={`/reactions/${emojiToSlug(emoji)}.png`}
      alt={emoji}
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
