import { useState } from 'preact/hooks'
import { Route, Switch } from 'wouter-preact'
import { isbot } from 'isbot'

import './app.css'
import { HamsterPage, MainPage, NotFoundPage } from './pages'
import { useRotatingTitle } from './hooks'

export function App() {
  const [isHamster, setIsHamster] = useState(Math.random() >= 0.5 && !isbot(navigator.userAgent))

  useRotatingTitle()

  return (
    <Switch>
      <Route path='/'>
        {isHamster ? <HamsterPage onButtonClick={() => setIsHamster(false)} /> : <MainPage />}
      </Route>

      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
