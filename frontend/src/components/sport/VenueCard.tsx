import { memo, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { VenueResponse } from '../../api/venues'
import type { SportTheme } from '../../config/sportThemes'
import { grounds } from '../../content/sportPage'
import { useInView } from '../../hooks/useInView'
import { isPlainClick } from '../../utils/events'
import { venuePath } from '../../utils/paths'
import { decodeImage } from '../../utils/preload'
import { venueMorphProps, type VenuePreview } from '../../utils/venueTransition'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Price } from '../ui/Price'
import './VenueCard.css'

const DECODE_WAIT_MS = 150

interface VenueCardProps {
  venue: VenueResponse
  sport: SportTheme
  image: string
}

export const VenueCard = memo(function VenueCard({ venue, sport, image }: VenueCardProps) {
  const { ref, inView } = useInView<HTMLElement>()
  const preview: VenuePreview = { venue, image }
  const navigate = useNavigate()
  const path = venuePath(venue, sport)

  const reserve = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return
    event.preventDefault()
    decodeImage(image, DECODE_WAIT_MS).then(() => navigate(path, { state: preview, viewTransition: true }))
  }

  return (
    <article ref={ref} className="reveal" data-state={inView ? 'visible' : undefined} data-cursor-accent>
      <Card className="venue-card">
        <div className="venue-card__media zoom-media" {...venueMorphProps(venue.id)}>
          <img src={image} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="venue-card__body">
          <h3 className="venue-card__name">{venue.name}</h3>
          <p className="venue-card__muted">
            {venue.address}, {venue.city}
          </p>
          {venue.description && <p>{venue.description}</p>}
          <div className="venue-card__footer">
            <Price amount={venue.pricePerHour} variant="tag" />
            <Button
              to={path}
              state={preview}
              label={grounds.reserve}
              withArrow
              quiet
              viewTransition
              onClick={reserve}
            />
          </div>
        </div>
      </Card>
    </article>
  )
})

export function VenueCardSkeleton() {
  return (
    <Card className="venue-card" aria-hidden="true">
      <div className="venue-card__media skeleton" />
      <div className="venue-card__body">
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--short" />
        <div className="skeleton skeleton--line" />
      </div>
    </Card>
  )
}
