export const emojiToSlug = (emoji: string) => {
  const codepoints: string[] = []

  for (const char of emoji) {
    const code = char.codePointAt(0)

    if (code === undefined) {
      continue
    }

    codepoints.push(code.toString(16))
  }

  return codepoints.join('-')
}
