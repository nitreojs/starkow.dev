import type { Lang } from '@starkow.dev/wordle-engine'

export type KeyKind = 'letter' | 'enter' | 'back'

export interface KeyDef {
  kind: KeyKind
  label: string
  key?: string
}

const letter = (k: string): KeyDef => ({ kind: 'letter', label: k, key: k })

const EN: KeyDef[][] = [
  ['q','w','e','r','t','y','u','i','o','p'].map(letter),
  ['a','s','d','f','g','h','j','k','l'].map(letter),
  [
    { kind: 'enter', label: '↵' },
    ...['z','x','c','v','b','n','m'].map(letter),
    { kind: 'back', label: '⌫' }
  ]
]

const RU: KeyDef[][] = [
  ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'].map(letter),
  ['ф','ы','в','а','п','р','о','л','д','ж','э'].map(letter),
  [
    { kind: 'enter', label: '↵' },
    ...['я','ч','с','м','и','т','ь','б','ю'].map(letter),
    { kind: 'back', label: '⌫' }
  ]
]

export const getLayout = (lang: Lang): KeyDef[][] => lang === 'ru' ? RU : EN
