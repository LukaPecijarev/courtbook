import { getJson, postJson } from './client'
import type { SportResponse } from './sports'

export interface VenueResponse {
  id: number
  name: string
  city: string
  address: string
  description: string | null
  pricePerHour: number
  openingTime: string
  closingTime: string
  sports: SportResponse[]
  surface: string | null
  badge: string | null
  amenities: string[]
}

export interface SlotResponse {
  startAt: string
  available: boolean
}

export function fetchVenues(sportId?: number, signal?: AbortSignal): Promise<VenueResponse[]> {
  return getJson<VenueResponse[]>(sportId === undefined ? '/venues' : `/venues?sportId=${sportId}`, signal)
}

export function fetchVenue(id: number, signal?: AbortSignal): Promise<VenueResponse> {
  return getJson<VenueResponse>(`/venues/${id}`, signal)
}

export function fetchAvailability(
  venueId: number,
  date: string,
  sportId: number,
  signal?: AbortSignal,
): Promise<SlotResponse[]> {
  return getJson<SlotResponse[]>(`/venues/${venueId}/availability?date=${date}&sportId=${sportId}`, signal)
}

export async function createBooking(
  venueId: number,
  request: { sportId: number; startAt: string; customerName: string; customerEmail: string },
): Promise<void> {
  await postJson(`/venues/${venueId}/bookings`, request)
}
