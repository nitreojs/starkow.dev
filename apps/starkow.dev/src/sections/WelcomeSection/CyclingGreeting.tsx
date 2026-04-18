import { FC, useEffect, useState } from 'preact/compat'

const greetings = [
  'hello',
  'hi',
  'привет',
  'hola',
  'bonjour',
  'olá',
  'こんにちは',
  '你好',
  'hallo',
  'ciao',
  'salut',
  'yo',
  'hey'
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
