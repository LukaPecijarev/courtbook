import { findSportByThemeId } from '../api/sports'
import { fetchVenues, type VenueResponse } from '../api/venues'
import { useAsync, type AsyncState } from './useAsync'

export interface SportVenues {
  sportId: string
  venues: VenueResponse[]
}

const lastLoaded = new Map<string, SportVenues>()

export function forgetSportVenues() {
  lastLoaded.clear()
}

async function loadVenues(sportId: string, signal: AbortSignal): Promise<SportVenues> {
  const sport = await findSportByThemeId(sportId)
  const venues = sport ? await fetchVenues(sport.id, signal) : []
  const result = { sportId, venues }
  lastLoaded.set(sportId, result)
  return result
}

export function useSportVenues(sportId: string): AsyncState<SportVenues> {
  return useAsync(`sport-venues:${sportId}`, (signal) => loadVenues(sportId, signal), lastLoaded.get(sportId))
}
