export interface AnimatorFrame {
  text: string
  delay: number
}

// returns `null` when the animator has completed its cycle
export type TitleAnimator = (title: string, frame: number) => AnimatorFrame | null

const SCRAMBLE_GLYPHS = 'abcdefghijklmnopqrstuvwxyz★•0123456789'
const randomGlyph = () => SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)]

const rotateLeft: TitleAnimator = (title, frame) => {
  const full = `${title} `

  if (frame >= full.length) {
    return null
  }

  const offset = frame % full.length

  return { text: full.slice(offset) + full.slice(0, offset), delay: 500 }
}

const rotateRight: TitleAnimator = (title, frame) => {
  const full = `${title} `

  if (frame >= full.length) {
    return null
  }

  const offset = (full.length - frame) % full.length

  return { text: full.slice(offset) + full.slice(0, offset), delay: 500 }
}

const typing: TitleAnimator = (title, frame) => {
  const n = title.length
  const ERASE = n
  const BLINK = 5
  const TYPE = n - 1
  const HOLD = 6

  if (frame >= ERASE + BLINK + TYPE + HOLD) {
    return null
  }

  // phase 1: erase one char at a time
  if (frame < ERASE) {
    const remaining = n - frame

    return { text: `${title.slice(0, remaining)}|`, delay: 80 }
  }

  // phase 2: blink cursor next to the lone first char
  if (frame < ERASE + BLINK) {
    const blinkFrame = frame - ERASE

    return { text: `${title[0]}${blinkFrame % 2 === 0 ? '|' : ' '}`, delay: 350 }
  }

  // phase 3: type chars back in
  if (frame < ERASE + BLINK + TYPE) {
    const typed = frame - ERASE - BLINK + 2

    return { text: `${title.slice(0, typed)}|`, delay: 100 }
  }

  // phase 4: hold full title with blinking cursor at the end
  const holdFrame = frame - ERASE - BLINK - TYPE

  return { text: `${title}${holdFrame % 2 === 0 ? '|' : ' '}`, delay: 350 }
}

const scramble: TitleAnimator = (title, frame) => {
  const n = title.length
  const FLICKER = 3
  const HOLD = 8

  if (frame >= n * FLICKER + HOLD) {
    return null
  }

  // hold full title after scramble settles
  if (frame >= n * FLICKER) {
    return { text: title, delay: 250 }
  }

  const settled = Math.floor(frame / FLICKER)
  let text = title.slice(0, settled)

  for (let i = settled; i < n; i++) {
    const ch = title[i]
    text += ch === ' ' ? ' ' : randomGlyph()
  }

  return { text, delay: 70 }
}

const wave: TitleAnimator = (title, frame) => {
  const n = title.length
  const HOLD = 6

  if (frame >= n + HOLD) {
    return null
  }

  if (frame >= n) {
    return { text: title, delay: 250 }
  }

  return {
    text: `${title.slice(0, frame)}★${title.slice(frame + 1)}`,
    delay: 140
  }
}

export const TITLE_ANIMATORS: TitleAnimator[] = [rotateLeft, rotateRight, typing, scramble, wave]
