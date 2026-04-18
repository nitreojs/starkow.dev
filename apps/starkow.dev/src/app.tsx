import { useEffect, useState } from 'preact/hooks'
import { Route, Switch } from 'wouter-preact'
import { isbot } from 'isbot'

import { useRotatingTitle } from '@starkow.dev/hooks'

import { HamsterPage, MainPage, NotFoundPage } from './pages'
import { getTimeBucket, hydrateAdminKeyFromUrl } from './shared'
// import { NoiseCanvas } from './components'

import './app.css'

hydrateAdminKeyFromUrl()

export function App() {
  const [isHamster, setIsHamster] = useState(Math.random() >= 0.98 && !isbot(navigator.userAgent))

  useRotatingTitle()

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.tod = getTimeBucket()
    }

    apply()
    const id = setInterval(apply, 15 * 60 * 1000)

    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* <NoiseCanvas /> */}

      <Switch>
        <Route path='/'>
          {isHamster ? <HamsterPage onButtonClick={() => setIsHamster(false)} /> : <MainPage />}
        </Route>
  
        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </>
  )
}
