import { FC } from 'preact/compat'

import { IconExternalLink, IconTypeScript, IconJavaScript, IconPython } from '@starkow.dev/icons'

import { RichContent } from '../../RichContent'
import type { Project } from '../../types'

import './style.css'

const LANGUAGE_META: Record<string, { label: string, Icon: FC }> = {
  typescript: { label: 'typescript', Icon: IconTypeScript },
  javascript: { label: 'javascript', Icon: IconJavaScript },
  python: { label: 'python', Icon: IconPython }
}

interface ProjectCardProps {
  project: Project
  index: number
}

export const ProjectCard: FC<ProjectCardProps> = ({ project: p, index }) => {
  const cardStyle: Record<string, string | number> = { '--i': index }

  if (p.accentFrom) {
    cardStyle['--accent-from'] = p.accentFrom
  }

  if (p.accentTo) {
    cardStyle['--accent-to'] = p.accentTo
  }

  const lang = p.language ? LANGUAGE_META[p.language] : undefined

  return (
    <a
      class='project-card'
      style={cardStyle}
      href={p.url}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={`open ${p.name}`}
    >
      <div class='project-header'>
        <span class='project-header-title'>
          <b>{ p.name }</b>
        </span> {' '}

        <span class='project-link'>
          <IconExternalLink />
        </span>
      </div>

      <div class='project-body'>
        <RichContent content={p.description} />
      </div>

      {
        (lang || p.tags?.length)
          ? (
            <div class='project-footer'>
              {
                lang
                  ? (
                    <span class='project-lang' title={p.language}>
                      <lang.Icon />
                    </span>
                  )
                  : undefined
              }

              {
                (lang && p.tags?.length)
                  ? <span class='project-footer-separator'>•</span>
                  : undefined
              }

              {
                p.tags?.length
                  ? p.tags.map(t => <span class='project-tag' data-tag={t}>{ t }</span>)
                  : undefined
              }
            </div>
          )
          : undefined
      }
    </a>
  )
}
