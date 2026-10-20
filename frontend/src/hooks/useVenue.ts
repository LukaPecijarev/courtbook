import { fetchVenue, type VenueResponse } from '../api/venues'
import { useAsync, type AsyncState } from './useAsync'

export function useVenue(venueId: number): AsyncState<VenueResponse> {
  return useAsync(`venue:${venueId}`, (signal) => fetchVenue(venueId, signal))
}
