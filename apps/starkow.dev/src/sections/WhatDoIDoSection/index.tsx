import { FC } from 'preact/compat'

import { ProjectCard } from './components'
import type { Project } from './types'

import './style.css'

export type { Content, Project } from './types'

interface WhatDoIDoSectionProps {
  projects: Project[]
}

export const WhatDoIDoSection: FC<WhatDoIDoSectionProps> = ({ projects = [] }) => (
  <section id='what-do-i-do'>
    <h2>what do i do?</h2>

    <div class='projects-grid'>
      {
        projects.map((p, i) => (
          <ProjectCard project={p} index={i} />
        ))
      }
    </div>

    <span class='text-half-visible text-small'>
      i don't have much to say about myself honestly sooo...
    </span>
  </section>
)
