import { FC } from 'preact/compat'

import { ProjectCard } from './components'
import type { Project } from './types'

import './style.css'

export type { Content, Project } from './types'

export type ProjectsStatus = 'loading' | 'ready' | 'error'

interface WhatDoIDoSectionProps {
  projects: Project[]
  status?: ProjectsStatus
}

export const WhatDoIDoSection: FC<WhatDoIDoSectionProps> = ({ projects = [], status = 'ready' }) => {
  const isEmpty = projects.length === 0

  return (
    <section id='what-do-i-do'>
      <h2>what do i do?</h2>

      {isEmpty ? (
        <p class='projects-fallback text-half-visible'>
          {status === 'loading' && 'loading projects...'}
          {status === 'error' && "couldn't load projects — try refreshing?"}
          {status === 'ready' && 'nothing here yet — come back later!'}
        </p>
      ) : (
        <div class='projects-grid'>
          {projects.map((p, i) => (
            <ProjectCard project={p} index={i} />
          ))}
        </div>
      )}

      <span class='text-half-visible text-small'>
        i don't have much to say about myself honestly sooo...
      </span>
    </section>
  )
}
