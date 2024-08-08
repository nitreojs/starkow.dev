import { CoolButton } from '../../components'
import * as Icons from '@starkow.dev/shared/icons'
import { Link } from 'wouter-preact'

export const NotFoundPage = () => {
  document.title = 'starkow★dev • page not found'

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