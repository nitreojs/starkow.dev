import { FC } from 'preact/compat'

import './style.css'

interface SkillProps {
  name: string
  Icon?: FC
  href?: string
  note?: string
  since?: string | Date
  disliked?: boolean
}

function yearsSince (date: string | Date): number {
  const then = new Date(date)
  const now = new Date()
  let years = now.getFullYear() - then.getFullYear()

  const beforeAnniversary =
    now.getMonth() < then.getMonth() ||
    (now.getMonth() === then.getMonth() && now.getDate() < then.getDate())

  if (beforeAnniversary) {
    years--
  }

  return Math.max(0, years)
}

function sinceNote (date: string | Date): string | undefined {
  const yrs = yearsSince(date)

  if (yrs === 0) {
    return undefined
  }

  return `${yrs}yr${yrs === 1 ? '' : 's'}`
}

export const Skill: FC<SkillProps> = ({ name, Icon, href, note, since, disliked }) => {
  const sinceText = since ? sinceNote(since) : undefined

  const tooltip =
    note && sinceText
      ? `${note} · ${sinceText}`
      : note ?? sinceText

  const content = (
    <>
      {Icon && <Icon />}
      <span class='skill-name'>{name}</span>
    </>
  )

  const commonProps = {
    class: `skill with-note${disliked ? ' skill-disliked' : ''}`,
    'data-note': tooltip
  }

  if (href) {
    return (
      <a
        {...commonProps}
        href={href}
        target='_blank'
        rel='noopener noreferrer'
      >
        {content}
      </a>
    )
  }

  return <span {...commonProps}>{content}</span>
}
