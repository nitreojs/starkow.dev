import type { FC } from 'preact/compat'
// import { Spoiler } from '../../components'

function calculateAgeSince (birthday: Date) {
  const now = new Date()
  const cloned = new Date(birthday)
  const diff = now.getFullYear() - birthday.getFullYear()

  return now.setFullYear(1970) < cloned.setFullYear(1970) ? diff - 1 : diff
}

// function calculateDaysSince (date: Date) {
//   const now = Date.now()
//   const then = date.getTime()
//   const delta = now - then

//   return Math.floor(delta / 1000 / 60 / 60 / 24)
// }

const BIRTHDAY = new Date('2004-05-30')

export const WelcomeSection: FC = () => {
  const age = calculateAgeSince(BIRTHDAY)
  // const dws = calculateDaysSince(BIRTHDAY)

  return (
    <section id="welcome">
      <h1>welcome!</h1>
      <p>
        hello! my name's <b>alex<span class="text-half-visible">ey</span> starkóv</b>, my nickname is <b>starków</b> and i'm <b>{age}</b> years old.
        {/* <Spoiler
          text={`which means i am a virgin for ${dws} days straight`}
          /> */}
      </p>
      <p>
        i do various stuff eventually, but mostly it's programming or something about programming {" "}
        <span class="text-half-visible"><i>(duh!)</i></span>
      </p>
    </section>
  )
}
