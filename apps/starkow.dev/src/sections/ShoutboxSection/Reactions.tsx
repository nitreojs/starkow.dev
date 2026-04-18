import { FC } from 'preact/compat'
import clsx from 'clsx'

interface ReactionsProps {
  available: string[]
  reactions?: Record<string, number>
  yourReactions?: string[]
  onToggle: (emoji: string) => void
}

export const Reactions: FC<ReactionsProps> = ({ available, reactions = {}, yourReactions = [], onToggle }) => {
  if (available.length === 0) {
    return null
  }

  const sorted = available
    .map((emoji, index) => ({ emoji, count: reactions[emoji] ?? 0, index }))
    .sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count
      }

      return a.index - b.index
    })

  return (
    <div class='shoutbox-reactions'>
      {sorted.map(({ emoji, count }) => {
        const mine = yourReactions.includes(emoji)

        return (
          <button
            key={emoji}
            type='button'
            class={clsx('shoutbox-reaction', mine && 'shoutbox-reaction-mine', count === 0 && 'shoutbox-reaction-empty')}
            onClick={() => onToggle(emoji)}
          >
            <span class='shoutbox-reaction-emoji'>{emoji}</span>
            {count > 0 && <span class='shoutbox-reaction-count'>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
