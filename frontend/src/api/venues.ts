import { getJson, postJson, sendJson, sendWithoutBody } from './client'
import type { SportResponse } from './sports'

export interface VenueResponse {
  id: number
  name: string
  city: string
  address: string | null
  description: string | null
  pricePerHour: number
  openingTime: string
  closingTime: string
  sports: SportResponse[]
  surface: string | null
  badge: string | null
  amenities: string[]
  imageUrl: string | null
}

export interface VenueListing {
  name: string
  description: string
  pricePerHour: number
  imageUrl: string | null
}

interface SlotSelection {
  dates: string[]
  startTimes: string[]
}

export interface CreatedVenueResponse {
  venue: VenueResponse
  managementKey: string
}

export interface ManagedSlotResponse {
  id: number
  startAt: string
  booked: boolean
}

const MANAGEMENT_KEY_HEADER = 'X-Management-Key'

function managementHeaders(managementKey: string): HeadersInit {
  return { [MANAGEMENT_KEY_HEADER]: managementKey }
}

export interface SlotResponse {
  startAt: string
  available: boolean
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

export function addVenue(
  listing: VenueListing,
  sportId: number,
  slots: SlotSelection,
): Promise<CreatedVenueResponse> {
  return postJson<CreatedVenueResponse>('/venues', { ...listing, sportId, ...slots })
}

export function verifyManagementKey(venueId: number, managementKey: string): Promise<void> {
  return sendWithoutBody('POST', `/venues/${venueId}/manage/verify`, managementHeaders(managementKey))
}

export function deleteVenue(venueId: number, managementKey: string): Promise<void> {
  return sendWithoutBody('DELETE', `/venues/${venueId}`, managementHeaders(managementKey))
}

export function updateVenue(venueId: number, managementKey: string, listing: VenueListing): Promise<VenueResponse> {
  return sendJson<VenueResponse>('PUT', `/venues/${venueId}`, listing, managementHeaders(managementKey))
}

export function fetchManagedSlots(
  venueId: number,
  managementKey: string,
  signal?: AbortSignal,
): Promise<ManagedSlotResponse[]> {
  return getJson<ManagedSlotResponse[]>(`/venues/${venueId}/slots`, signal, managementHeaders(managementKey))
}

export function publishSlots(
  venueId: number,
  managementKey: string,
  slots: SlotSelection,
): Promise<ManagedSlotResponse[]> {
  return sendJson<ManagedSlotResponse[]>('POST', `/venues/${venueId}/slots`, slots, managementHeaders(managementKey))
}

export function removeSlot(venueId: number, slotId: number, managementKey: string): Promise<void> {
  return sendWithoutBody('DELETE', `/venues/${venueId}/slots/${slotId}`, managementHeaders(managementKey))
}

export function blockSlot(venueId: number, managementKey: string, startAt: string): Promise<void> {
  return sendJson<void>('POST', `/venues/${venueId}/manage/blocks`, { startAt }, managementHeaders(managementKey))
}

export async function createBooking(
  venueId: number,
  request: { sportId: number; startAt: string; customerName: string; customerEmail: string },
): Promise<BookingResponse> {
  return postJson<BookingResponse>(`/venues/${venueId}/bookings`, request)
}
