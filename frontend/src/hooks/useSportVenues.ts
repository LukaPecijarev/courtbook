import { fetchSports, type SportResponse } from '../api/sports'
import { fetchVenues, type VenueResponse } from '../api/venues'
import { useAsync, type AsyncState } from './useAsync'

export interface SportVenues {
  sportId: string
  venues: VenueResponse[]
}

let sportsRequest: Promise<SportResponse[]> | null = null

function loadSports(): Promise<SportResponse[]> {
  sportsRequest ??= fetchSports().catch((error: unknown) => {
    sportsRequest = null
    throw error
  })
  return sportsRequest
}

const lastLoaded = new Map<string, SportVenues>()

async function loadVenues(sportId: string, signal: AbortSignal): Promise<SportVenues> {
  const sports = await loadSports()
  const sport = sports.find((candidate) => candidate.name.toLowerCase() === sportId)
  const venues = sport ? await fetchVenues(sport.id, signal) : []
  const result = { sportId, venues }
  lastLoaded.set(sportId, result)
  return result
}

export function useSportVenues(sportId: string): AsyncState<SportVenues> {
  return useAsync(`sport-venues:${sportId}`, (signal) => loadVenues(sportId, signal), lastLoaded.get(sportId))
}
