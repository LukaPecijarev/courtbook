import { Link } from 'react-router-dom'
import type { SportTheme } from '../../config/sportThemes'
import type { LandingSport } from '../../content/landing'
import { useInView } from '../../hooks/useInView'
import { accentStyle } from '../../utils/color'
import { sportPath } from '../../utils/paths'
import { Button } from '../ui/Button'
import { SectionTitle } from '../ui/SectionTitle'
import './SportBlock.css'

interface SportBlockProps {
  sport: LandingSport
  theme: SportTheme
  number: number
  imageSide: 'left' | 'right'
}

export function SportBlock({ sport, theme, number, imageSide }: SportBlockProps) {
  const { ref, inView } = useInView<HTMLElement>()
  const bookingPath = sportPath(theme)

  return (
    <article
      ref={ref}
      className="sport-block reveal"
      data-state={inView ? 'visible' : undefined}
      data-image-side={imageSide}
      style={accentStyle(theme.color)}
      data-cursor-accent
    >
      <Link to={bookingPath} className="sport-block__media zoom-media" aria-label={`Book ${theme.label}`}>
        <img src={theme.landingImage} alt="" loading="lazy" decoding="async" />
      </Link>
      <div className="sport-block__body">
        <span className="sport-block__number">{String(number).padStart(2, '0')}</span>
        <SectionTitle size="xl">{theme.label}</SectionTitle>
        <p className="sport-block__brief">{sport.brief}</p>
        <Button
          to={bookingPath}
          label="Book now"
          fillFrom={imageSide === 'left' ? 'right' : 'left'}
          withArrow
          viewTransition
        />
      </div>
    </article>
  )
}
