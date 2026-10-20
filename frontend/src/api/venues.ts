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
}

export interface SlotResponse {
  startAt: string
  available: boolean
}

export interface CreateBookingRequest {
  sportId: number
  startAt: string
  customerName: string
  customerEmail: string
}

export interface BookingResponse {
  id: number
  type: 'CUSTOMER' | 'BLOCKED'
  venueId: number
  venueName: string
  sportId: number | null
  sportName: string | null
  startAt: string
  durationMinutes: number
  customerName: string | null
  customerEmail: string | null
}

export function fetchVenues(sportId?: number, signal?: AbortSignal): Promise<VenueResponse[]> {
  return getJson<VenueResponse[]>(sportId === undefined ? '/venues' : `/venues?sportId=${sportId}`, signal)
}

export function fetchAvailability(
  venueId: number,
  date: string,
  sportId: number,
  signal?: AbortSignal,
): Promise<SlotResponse[]> {
  return getJson<SlotResponse[]>(`/venues/${venueId}/availability?date=${date}&sportId=${sportId}`, signal)
}

export function createBooking(venueId: number, request: CreateBookingRequest): Promise<BookingResponse> {
  return postJson<BookingResponse>(`/venues/${venueId}/bookings`, request)
}
