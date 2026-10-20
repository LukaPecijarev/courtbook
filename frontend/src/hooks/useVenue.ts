import { fetchVenues, type VenueResponse } from '../api/venues'
import { useAsync, type AsyncState } from './useAsync'

export interface VenueLookup {
  venue: VenueResponse
  allVenues: VenueResponse[]
}

async function loadVenue(venueId: number, signal: AbortSignal): Promise<VenueLookup | null> {
  const allVenues = await fetchVenues(undefined, signal)
  const venue = allVenues.find((candidate) => candidate.id === venueId)
  return venue ? { venue, allVenues } : null
}

export function useVenue(venueId: number): AsyncState<VenueLookup | null> {
  return useAsync(`venue:${venueId}`, (signal) => loadVenue(venueId, signal))
}
