import { FC, useEffect, useState } from 'preact/compat'

import * as Icons from '@starkow.dev/icons'

import { Skill } from '../../components'
import { API_URL, getFingerprint } from '../../shared'

import './style.css'

interface SocialLink {
  name: string
  url: string
  Icon: FC
  note?: string
}

const socials: SocialLink[] = [
  { name: 'github',     url: 'https://fwd.starkow.dev/github',     Icon: Icons.IconGitHub,     note: 'code lives here' },
  { name: 'telegram',   url: 'https://fwd.starkow.dev/telegram',   Icon: Icons.IconTelegram,   note: 'fastest way to reach me' },
  { name: 'steam',      url: 'https://fwd.starkow.dev/steam',      Icon: Icons.IconSteam,      note: 'games and such' },
  { name: 'soundcloud', url: 'https://fwd.starkow.dev/soundcloud', Icon: Icons.IconSoundcloud, note: 'what i listen to' }
]

const formatBuildDate = (iso: string): string => {
  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) {
    return iso
  }

  return d.toISOString().slice(0, 10)
}

export const FooterSection: FC = () => {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchViews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/views`, {
          headers: { 'X-Fingerprint': getFingerprint() }
        })

        const json = await response.json() as Record<string, any>

        if (!cancelled && json.ok) {
          setViews(json.data.count)
        }
      } catch {
        // silent — view counter is decorative
      }
    }

    fetchViews()

    return () => { cancelled = true }
  }, [])

  return (
  <footer class='site-footer'>
    <p class='info-line site-footer-socials'>
      {socials.map((s, i) => (
        <>
          {i > 0 && <span class='skill-sep'>•</span>}
          <Skill key={s.name} name={s.name} Icon={s.Icon} href={s.url} note={s.note} />
        </>
      ))}
    </p>

    <p>
      brought to you by <b>starkow</b> with ❤️
    </p>

    <p class='site-footer-credits'>
      some design ideas were taken from {' '}
      <Skill name='jsopn.com' href='https://jsopn.com' note='idealistic as fuck' />
      {' '}
      <Skill name='es3n1n.eu' href='https://es3n1n.eu' note='esenin hiiiii :3' />
      {' '}
      <Skill name='tei.su' href='https://tei.su' note='ummmmmmmmmm idk alina is cool tho' />
    </p>

    <p>
      i've never written a real website before this one btw
    </p>

    <p class='site-footer-stamp text-small'>
      built <span class='with-note' data-note={__BUILD_DATE__} tabindex={0}>{formatBuildDate(__BUILD_DATE__)}</span>
      {views !== null && (
        <>
          {' · '}
          <span class='with-note' data-note='what tooltip did you expect here' tabindex={0}>
            {views.toLocaleString()} views
          </span>
        </>
      )}
    </p>
  </footer>
  )
}
