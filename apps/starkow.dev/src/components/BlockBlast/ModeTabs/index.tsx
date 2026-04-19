import { FC } from 'preact/compat'

import type { ModeId } from '@starkow.dev/block-blast-engine'

interface BlockBlastModeTabsProps {
  current: ModeId
  onChange: (m: ModeId) => void
}

const LABELS: Record<ModeId, string> = {
  classic: 'classic',
  'limited-moves': 'limited moves',
  'big-board': 'big board'
}

const MODE_LIST: ModeId[] = ['classic', 'limited-moves', 'big-board']

export const BlockBlastModeTabs: FC<BlockBlastModeTabsProps> = ({ current, onChange }) => (
  <div class='bb-mode-tabs' role='tablist'>
    {MODE_LIST.map(m => (
      <button
        key={m}
        role='tab'
        aria-selected={current === m}
        class={`bb-mode-tab${current === m ? ' active' : ''}`}
        onClick={() => onChange(m)}
      >
        {LABELS[m]}
      </button>
    ))}
  </div>
)
