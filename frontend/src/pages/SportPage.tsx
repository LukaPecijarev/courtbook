import { useEffect } from 'react'
import { TopBar } from '../components/TopBar'
import { GroundsSection } from '../components/sport/GroundsSection'
import { SportCarousel } from '../components/sport/SportCarousel'
import { neighbourImages } from '../config/sportThemes'
import { carousel } from '../content/sportPage'
import { useSportCarousel } from '../hooks/useSportCarousel'
import { accentStyle } from '../utils/color'
import { preloadImages } from '../utils/preload'

export function SportPage() {
  const { current: theme } = useSportCarousel()

  useEffect(() => {
    if (theme) preloadImages(neighbourImages(theme))
  }, [theme])

  return (
    <div className="theme sport-page" style={theme && accentStyle(theme.color)}>
      <TopBar />
      {theme ? (
        <main>
          <SportCarousel theme={theme} />
          <GroundsSection theme={theme} />
        </main>
      ) : (
        <main className="sport-page__missing">
          <p>{carousel.unknownSport}</p>
        </main>
      )}
    </div>
  )
}
