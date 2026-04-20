import { FC } from 'preact/compat'

import { LANGS, LENGTHS, type Lang, type Length } from '@starkow.dev/wordle-engine'

interface Props {
  lang: Lang
  length: Length
  onLangChange: (l: Lang) => void
  onLengthChange: (n: Length) => void
  disabled?: boolean
}

export const ConfigTabs: FC<Props> = ({ lang, length, onLangChange, onLengthChange, disabled = false }) => (
  <div class='wdl-config'>
    <div class='wdl-mode-tabs' role='tablist' aria-label='language'>
      {LANGS.map(l => (
        <button
          key={l}
          role='tab'
          aria-selected={lang === l}
          disabled={disabled}
          class={`wdl-mode-tab${lang === l ? ' active' : ''}`}
          onClick={() => onLangChange(l)}
        >
          {l}
        </button>
      ))}
    </div>
    <div class='wdl-mode-tabs' role='tablist' aria-label='length'>
      {LENGTHS.map(n => (
        <button
          key={n}
          role='tab'
          aria-selected={length === n}
          disabled={disabled}
          class={`wdl-mode-tab${length === n ? ' active' : ''}`}
          onClick={() => onLengthChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
)
