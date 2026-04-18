import { FC } from 'preact/compat'

import { IconExternalLink, IconTypeScript, IconJavaScript, IconPython } from '@starkow.dev/icons'

import { RichContent } from './RichContent'
import type { Project } from './types'

import './style.css'

export type { Content, Project } from './types'

const LANGUAGE_META: Record<string, { label: string, Icon: FC }> = {
  typescript: { label: 'typescript', Icon: IconTypeScript },
  javascript: { label: 'javascript', Icon: IconJavaScript },
  python: { label: 'python', Icon: IconPython }
}

interface WhatDoIDoSectionProps {
  projects: Project[]
}

export const WhatDoIDoSection: FC<WhatDoIDoSectionProps> = ({ projects = [] }) => (
  <section id='what-do-i-do'>
    <h2>what do i do?</h2>

    <div class='projects-grid'>
      {
        projects.map((p, i) => {
          const cardStyle: Record<string, string | number> = { '--i': i }

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
        })
      }
    </div>

    <span class='text-half-visible text-small'>
      i don't have much to say about myself honestly sooo...
    </span>
  </section>
)
