import { useState } from 'preact/hooks'
import { Route, Switch } from 'wouter-preact'
import { isbot } from 'isbot'

import { Hooks } from '@starkow.dev/shared'

import { HamsterPage, MainPage, NotFoundPage } from './pages'

import './app.css'

export function App() {
  const [isHamster, setIsHamster] = useState(Math.random() >= 0.98 && !isbot(navigator.userAgent))

  Hooks.useRotatingTitle()

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
