import { Finale } from '../components/landing/Finale'
import { Hero } from '../components/landing/Hero'
import { SportBlock } from '../components/landing/SportBlock'
import { findSportTheme } from '../config/sportThemes'
import { landingSports } from '../content/landing'

const sportBlocks = landingSports.flatMap((sport) => {
  const theme = findSportTheme(sport.sportId)
  return theme ? [{ sport, theme }] : []
})

export function LandingPage() {
  return (
    <div className="theme landing">
      <Hero />
      <main>
        <section id="sports" aria-label="Sports">
          {sportBlocks.map(({ sport, theme }, index) => (
            <SportBlock
              key={theme.id}
              sport={sport}
              theme={theme}
              number={index + 1}
              imageSide={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </section>
      </main>
      <Finale />
    </div>
  )
}
