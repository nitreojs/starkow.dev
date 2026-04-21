import { Link } from 'wouter-preact'
import * as Icons from '@starkow.dev/icons'

import { useTitleSuffix } from '@starkow.dev/hooks'

import { CoolButton } from '../../components'

export const NotFoundPage = () => {
  useTitleSuffix('page not found')

  const path = decodeURIComponent(window.location.pathname.slice(1))

  return (
    <div class='error-container-centered'>
      <p class='text-large'>
        404
      </p>

      <div class='isolated'>
        <p>
          wtf is a <b>{path}</b>?
        </p>

        <p class='text-small text-half-visible gapped'>
          not a single thing here...
        </p>
      </div>

      <Link href='/' asChild>
        <CoolButton icon={Icons.IconHome} />
      </Link>
    </div>
  )
}
