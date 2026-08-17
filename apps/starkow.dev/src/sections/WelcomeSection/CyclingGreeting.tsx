import { FC, useEffect, useState } from 'preact/compat'

const greetings = [
  'hi',
  'привет',
  'hola',
  'bonjour',
  'привiт',
  'olá',
  'こんにちは',
  'cześć',
  '你好',
  'hallo',
  'ciao',
  'salut',
  'yo',
  'hey',
  'console.log(\'hello world\')'
]

const INTERVAL_MS = 2600

export const CyclingGreeting: FC = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % greetings.length), INTERVAL_MS)

    return () => clearInterval(id)
  }, [])

  return (
    <span class='cycling-greeting' key={index}>
      {greetings[index]}
    </span>
  )
}
