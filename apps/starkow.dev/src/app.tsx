import { useState } from 'preact/hooks'
import { Route, Switch } from 'wouter-preact'
import { isbot } from 'isbot'

import { useRotatingTitle } from '@starkow.dev/hooks'

import { HamsterPage, MainPage, NotFoundPage } from './pages'
// import { NoiseCanvas } from './components'

import './app.css'

export function App() {
  const [isHamster, setIsHamster] = useState(Math.random() >= 0.98 && !isbot(navigator.userAgent))

  useRotatingTitle()

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
