import { FC, useEffect, useState } from 'preact/compat'

const words = ['wordl', 'hello', 'guess', 'bored']

const pickDelay = () => 5000 + Math.random() * 5000

export const WordleDecor: FC = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setIndex(i => (i + 1) % words.length), pickDelay())

    return () => clearTimeout(id)
  }, [index])

  const letters = words[index].split('')

  return (
    <svg viewBox='0 0 140 28' xmlns='http://www.w3.org/2000/svg'>
      <g key={index} class='wordle-decor-word'>
        {letters.map((letter, i) => (
          <g key={i} transform={`translate(${i * 28}, 0)`}>
            <rect x='0' y='0' width='26' height='26' rx='3' />
            <text
              x='13'
              y='14'
              text-anchor='middle'
              dominant-baseline='central'
              font-family='inherit'
              font-size='16'
              font-weight='700'
            >
              {letter}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
