import { FC } from 'preact/compat'

import type { Mode } from '@starkow.dev/wordle-engine'

interface Props { current: Mode; onChange: (m: Mode) => void }

const MODES: Mode[] = ['daily', 'infinite']

export const ModeTabs: FC<Props> = ({ current, onChange }) => (
  <div class='wdl-mode-tabs' role='tablist'>
    {MODES.map(m => (
      <button
        key={m}
        role='tab'
        aria-selected={current === m}
        class={`wdl-mode-tab${current === m ? ' active' : ''}`}
        onClick={() => onChange(m)}
      >
        {m}
      </button>
    ))}
  </div>
)
