import { memo, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { VenueResponse } from '../../api/venues'
import type { SportTheme } from '../../config/sportThemes'
import { manageKeyDialog } from '../../content/ownerPage'
import { grounds } from '../../content/sportPage'
import { useInView } from '../../hooks/useInView'
import { venuePath } from '../../utils/paths'
import { decodeImage } from '../../utils/preload'
import { isPlainClick, prefersReducedMotion, venueLocation } from '../../utils/ui'
import { venueTransitionName, type VenuePreview } from '../../utils/venueTransition'
import { ManageKeyDialog } from '../owner/ManageKeyDialog'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Price } from '../ui/Price'

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
  const [managing, setManaging] = useState(false)
  const path = venuePath(venue, sport)

  const reserve = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return
    event.preventDefault()
    decodeImage(image, DECODE_WAIT_MS).then(() =>
      navigate(path, { state: preview, viewTransition: !prefersReducedMotion() }),
    )
  }

  return (
    <article ref={ref} className="reveal" data-state={inView ? 'visible' : undefined} data-cursor-accent>
      <Card className="venue-card">
        <div className="venue-card__media zoom-media" style={{ viewTransitionName: venueTransitionName(venue.id) }}>
          <img src={image} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="venue-card__body">
          <h3 className="venue-card__name">{venue.name}</h3>
          <p className="venue-card__muted">
            {venueLocation(venue)}
          </p>
          {venue.description && <p>{venue.description}</p>}
          <div className="venue-card__footer">
            <Price amount={venue.pricePerHour} variant="tag" />
            <div className="venue-card__actions">
              <Button
                type="button"
                label={manageKeyDialog.open}
                size="sm"
                quiet
                accent={sport.color}
                onClick={() => setManaging(true)}
              />
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
        </div>
      </Card>
      {managing && <ManageKeyDialog venueId={venue.id} venueName={venue.name} onClose={() => setManaging(false)} />}
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
