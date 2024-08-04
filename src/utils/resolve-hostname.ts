import punycode from 'punycode/'

const isPseudoHostname = (hostname: string) => ['-dton.magic.org', '.ton.run', '.ton.website'].some(suffix => hostname.endsWith(suffix))
const isPunycodeHostname = (hostname: string) => hostname.startsWith('xn-')

export const resolveHostname = (hostname: string) => {
  if (isPseudoHostname(hostname)) {
    if (isPunycodeHostname(hostname)) {
      if (hostname.includes('80akr5b')) {
        return 'алех.ton'
      }
    }

    if (hostname.startsWith('winterfall')) {
      return 'winterfall.ton'
    }
  }

  return punycode.toUnicode(hostname)
}
