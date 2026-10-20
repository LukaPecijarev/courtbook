import type { VenueResponse } from '../api/venues'

export function venueTransitionName(venueId: number): string {
  return `venue-${venueId}`
}

export interface VenuePreview {
  venue: VenueResponse
  image: string
}

export function isVenuePreview(state: unknown, venueId: number): state is VenuePreview {
  const preview = state as VenuePreview | null
  return typeof preview?.image === 'string' && preview.venue?.id === venueId
}
