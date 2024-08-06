import { FC } from 'preact/compat'

import { BulletLink } from '../../components'

interface Project {
  name: string
  url: string
  description: string
}

interface WhatDoIDoSectionProps {
  projects: Project[]
}

export const WhatDoIDoSection: FC<WhatDoIDoSectionProps> = ({ projects = [] }) => (
  <section id='what-do-i-do'>
    <h2>what do i do?</h2>
    <ul>
      {
        projects.map(p => (
          <li>
            <BulletLink text={p.name} url={p.url} /> {" "}
            <span class='text-half-visible'>is</span> {" "}
            {p.description}
          </li>
        ))
      }
    </ul>
    {/* ... and that's pretty much it for now! {" "} */}
    <span class='text-half-visible text-small'>
      i don't have much to say about myself honestly sooo...
    </span>
  </section>
)
