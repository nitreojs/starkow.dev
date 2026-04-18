import type { Content } from '../../components'

export type { Content } from '../../components'

export interface Project {
  name: string
  url: string
  description: Content[]

  accentFrom?: string
  accentTo?: string
  language?: string
  tags?: string[]
}
