import { render } from 'preact'

import { App } from './app.tsx'

import './index.css'

render(<App />, document.getElementById('app')!)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
