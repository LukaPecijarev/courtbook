import type { VenueResponse } from '../api/venues'
import { sportThemes, type SportTheme } from '../config/sportThemes'

export function sportPath(sport: SportTheme): string {
  return `/sports/${sport.id}`
}

export const DEFAULT_SPORT_PATH = sportPath(sportThemes[0])

export function venuePath(venue: VenueResponse, sport: SportTheme): string {
  return `/venues/${venue.id}?sport=${sport.id}`
}

export function addVenuePath(sport: SportTheme): string {
  return `/sports/${sport.id}/venues/new`
}

export function manageVenuePath(venueId: number): string {
  return `/venues/${venueId}/manage`
}

export function pageKey(pathname: string): string {
  return pathname.split('/')[1] ?? ''
}
