import type { VenueResponse } from '../api/venues'
import { morphProps } from './viewTransitions'

export function venueMorphProps(venueId: number) {
  return morphProps(`venue-${venueId}`)
}

export interface VenuePreview {
  venue: VenueResponse
  image: string
}

export function isVenuePreview(state: unknown, venueId: number): state is VenuePreview {
  const preview = state as VenuePreview | null
  return typeof preview?.image === 'string' && preview.venue?.id === venueId
}
