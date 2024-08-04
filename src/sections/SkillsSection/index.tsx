import type { FC } from 'preact/compat'

export const SkillsSection: FC = () => (
  <section id="skills">
    <h2>skills <span class="text-half-visible">(and not only)</span></h2>
    <p>
      i love and adore those things below:
    </p>

    <ul>
      <li>
        typescript <span class="text-half-visible">(node.js)</span>
      </li>
      <li>
        postgresql, redis
      </li>
      <li>
        writing my own versions of libraries/projects that already exist
      </li>
      <li>
        cats 🐈
      </li>
    </ul>
  </section>
)
