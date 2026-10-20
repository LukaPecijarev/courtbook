import { memo, type CSSProperties } from 'react'
import { findSportTheme, venueImageFor, type SportTheme } from '../../config/sportThemes'
import { grounds } from '../../content/sportPage'
import type { AsyncState } from '../../hooks/useAsync'
import { useSportVenues, type SportVenues } from '../../hooks/useSportVenues'
import { SportBackdrop } from '../SportBackdrop'
import { SectionTitle } from '../ui/SectionTitle'
import { VenueCard, VenueCardSkeleton } from './VenueCard'

const SKELETON_COUNT = 3

interface GroundsSectionProps {
  theme: SportTheme
}

export const GroundsSection = memo(function GroundsSection({ theme }: GroundsSectionProps) {
  const venues = useSportVenues(theme.id)
  const style = { '--section-bg': `url(${theme.backgroundImage})` } as CSSProperties

  return (
    <section className="grounds" aria-labelledby="grounds-title" style={style}>
      <SportBackdrop image={theme.backgroundImage} />
      <div className="grounds__inner">
        <SectionTitle id="grounds-title">{grounds.title}</SectionTitle>
        <GroundsContent state={venues} />
      </div>
    </section>
  )
})

function GroundsContent({ state }: { state: AsyncState<SportVenues> }) {
  if (state.status === 'loading') {
    return state.previous ? (
      <VenueList data={state.previous} stale />
    ) : (
      <div className="grounds__list" aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <VenueCardSkeleton key={index} />
        ))}
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <p className="grounds__error" role="alert">
        {grounds.error}
      </p>
    )
  }
  if (state.data.venues.length === 0) {
    return <p>{grounds.empty}</p>
  }
  return <VenueList key={state.data.sportId} data={state.data} />
}

interface VenueListProps {
  data: SportVenues
  stale?: boolean
}

const VenueList = memo(function VenueList({ data, stale = false }: VenueListProps) {
  const sport = findSportTheme(data.sportId)
  if (!sport) return null
  return (
    <div className="grounds__list" data-state={stale ? 'stale' : undefined} aria-busy={stale || undefined}>
      {data.venues.map((venue, position) => (
        <VenueCard key={venue.id} venue={venue} sport={sport} image={venueImageFor(sport, position)} />
      ))}
    </div>
  )
})
