import { FC, lazy, Suspense, useEffect, useState } from 'preact/compat'
import { Link, Route, Switch, useLocation } from 'wouter-preact'
import { isbot } from 'isbot'

import { useRotatingTitle } from '@starkow.dev/hooks'

import { HamsterPage, MainPage, NotFoundPage } from './pages'
import { getTimeBucket, hydrateAdminKeyFromUrl } from './shared'
// import { NoiseCanvas } from './components'

import './app.css'

const BackToHome: FC = () => {
  const [location] = useLocation()

  if (location === '/') return null

  return (
    <Link href='/' class='app-home-link' aria-label='back to home'>
      <svg viewBox='0 0 16 12' width='16' height='12' aria-hidden='true'>
        <path d='M6 0L0 6l6 6v-4h10V4H6z' fill='currentColor' />
      </svg>
      <span class='app-home-link-label'>home</span>
    </Link>
  )
}

const BlockBlastPage = lazy(() => import('./pages/BlockBlast').then(m => ({ default: m.BlockBlastPage }))) as unknown as FC
const WordlePage = lazy(() => import('./pages/Wordle').then(m => ({ default: m.WordlePage }))) as unknown as FC

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

      <BackToHome />

      <Switch>
        <Route path='/'>
          {isHamster ? <HamsterPage onButtonClick={() => setIsHamster(false)} /> : <MainPage />}
        </Route>

        <Route path='/blockblast'>
          <Suspense fallback={<p class='text-half-visible'>loading…</p>}>
            <BlockBlastPage />
          </Suspense>
        </Route>

        <Route path='/wordle'>
          <Suspense fallback={<p class='text-half-visible'>loading…</p>}>
            <WordlePage />
          </Suspense>
        </Route>

        <Route path='/wordle/daily/:index'>
          <Suspense fallback={<p class='text-half-visible'>loading…</p>}>
            <WordlePage />
          </Suspense>
        </Route>

        <Route>
          <NotFoundPage />
        </Route>
      </Switch>
    </>
  )
}
