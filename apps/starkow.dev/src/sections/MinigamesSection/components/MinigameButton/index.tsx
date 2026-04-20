import type { ComponentProps, FC } from 'preact/compat'
import type { ComponentChildren } from 'preact'

import { BlockBlastDecorLeft, BlockBlastDecorRight } from './decor/BlockBlastDecor'
import { WordleDecor } from './decor/WordleDecor'

import './style.css'

type MinigameTheme = 'blockblast' | 'wordle'

interface MinigameButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  theme: MinigameTheme
  text: string
  description?: ComponentChildren
}

interface Decors {
  left?: FC
  right?: FC
}

const decorFor: Record<MinigameTheme, Decors> = {
  blockblast: { left: BlockBlastDecorLeft, right: BlockBlastDecorRight },
  wordle: { right: WordleDecor }
}

export const MinigameButton: FC<MinigameButtonProps> = ({ theme, text, description, ...props }) => {
  const { left: LeftDecor, right: RightDecor } = decorFor[theme]

  return (
    <button class='minigame-button' data-theme={theme} {...props}>
      {LeftDecor && (
        <span class='minigame-button__decor minigame-button__decor--left' aria-hidden='true'>
          <LeftDecor />
        </span>
      )}

      <span class='minigame-button__text-wrap'>
        <span class='minigame-button__title'>{text}</span>
        {description && <span class='minigame-button__description'>{description}</span>}
      </span>

      {RightDecor && (
        <span class='minigame-button__decor minigame-button__decor--right' aria-hidden='true'>
          <RightDecor />
        </span>
      )}
    </button>
  )
}
