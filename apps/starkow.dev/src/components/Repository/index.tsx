import { FC, useEffect, useState } from 'preact/compat'

import './style.css'
import { IconGitHub, IconStar } from '@starkow.dev/icons'

interface RepositoryProps {
  url: string
}

export const Repository: FC<RepositoryProps> = ({ url }) => {
  const [repositoryData, setRepositoryData] = useState<Record<string, any> | null>(null)
  // const [commits, setCommits] = useState<Record<string, any>[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch('https://api.github.com/repos/nitreojs/starkow.dev')
      .then(r => r.json())
      .then(d => setRepositoryData(d))
      // .then(() => fetch('https://api.github.com/repos/nitreojs/starkow.dev/commits'))
      // .then(r => r.json())
      // .then(d => setCommits(d))
      .then(() => setIsLoading(false))
      // .catch(e => setError(e))
      .catch(() => {})
  }, [])

  return (
    <a class='repository' href={url}>
      <div class='repository-icon'>
        <IconGitHub />
      </div>
      <div class='repository-data'>
        {
          isLoading ? (
            <p>
              loading...
            </p>
          ) : (
            <>
              <div class='repository-title text-small'>
                <b>{repositoryData?.full_name}</b>
              </div>
              <div class='repository-description text-small'>
                <span><i>{repositoryData?.description}</i></span>
                <IconStar />
                <span>{repositoryData?.stargazers_count}</span>
              </div>
            </>
          )
        }
      </div>
    </a>
  )
}
