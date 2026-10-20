import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import type { VenueResponse } from '../api/venues'
import { TopBar } from '../components/TopBar'
import { VenueDetail } from '../components/venue/VenueDetail'
import { findSportTheme, venueImageFor, type SportTheme } from '../config/sportThemes'
import { venuePage } from '../content/venuePage'
import { useVenue } from '../hooks/useVenue'
import { DEFAULT_SPORT_PATH } from '../utils/paths'
import { isVenuePreview } from '../utils/venueTransition'
import './VenuePage.css'

interface SportOffer {
  sport: SportTheme
  sportId: number
}

function pickSport(venue: VenueResponse, requested: string | null): SportOffer | undefined {
  const offers = venue.sports.flatMap((offered) => {
    const sport = findSportTheme(offered.name)
    return sport ? [{ sport, sportId: offered.id }] : []
  })
  return offers.find((offer) => offer.sport.id === requested) ?? offers[0]
}

function positionInSport(allVenues: VenueResponse[], venue: VenueResponse, sportId: number): number {
  const sportVenues = allVenues.filter((candidate) => candidate.sports.some((sport) => sport.id === sportId))
  return Math.max(0, sportVenues.findIndex((candidate) => candidate.id === venue.id))
}

export function VenuePage() {
  const { venueId = '' } = useParams()
  const id = Number(venueId)
  const [searchParams] = useSearchParams()
  const { state } = useLocation()
  const lookup = useVenue(id)
  const preview = isVenuePreview(state, id) ? state : undefined

  if (lookup.status === 'error') return <VenuePageMessage message={venuePage.loadError} isError />
  if (lookup.status === 'loading' && !preview) return <VenuePageMessage loading />

  const loaded = lookup.status === 'loaded' ? lookup.data : undefined
  const venue = loaded?.venue ?? preview?.venue
  const offer = venue && pickSport(venue, searchParams.get('sport'))
  if (!venue || !offer) return <VenuePageMessage message={venuePage.notFound} />

  const image =
    preview?.image ?? venueImageFor(offer.sport, positionInSport(loaded?.allVenues ?? [], venue, offer.sportId))
  return (
    <VenueDetail
      key={`${venue.id}:${offer.sport.id}`}
      venue={venue}
      sport={offer.sport}
      sportId={offer.sportId}
      image={image}
    />
  )
}

interface VenuePageMessageProps {
  loading?: boolean
  message?: string
  isError?: boolean
}

function VenuePageMessage({ loading = false, message, isError = false }: VenuePageMessageProps) {
  return (
    <div className="theme venue-page">
      <TopBar />
      {loading ? (
        <div className="venue-page-skeleton" aria-busy="true">
          <div className="venue-page-skeleton__hero skeleton" />
          <div className="venue-page-skeleton__body">
            <div className="skeleton skeleton--line skeleton--short" />
            <div className="venue-page-skeleton__title skeleton" />
            <div className="skeleton skeleton--line" />
            <div className="venue-page-skeleton__days">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="venue-page-skeleton__day skeleton" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <main className="venue-page-message">
          <p className={isError ? 'venue-page-message__error' : undefined} role={isError ? 'alert' : undefined}>
            {message}
          </p>
          <Link to={DEFAULT_SPORT_PATH} className="top-bar__link">
            {venuePage.browseSports}
          </Link>
        </main>
      )}
    </div>
  )
}
