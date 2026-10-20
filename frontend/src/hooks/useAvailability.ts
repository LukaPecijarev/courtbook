import { fetchAvailability, type SlotResponse } from '../api/venues'
import { isPast } from '../utils/date'
import { useAsync, type AsyncState } from './useAsync'

export interface AvailabilitySlot extends SlotResponse {
  past: boolean
}

async function loadSlots(
  venueId: number,
  date: string,
  sportId: number,
  signal: AbortSignal,
): Promise<AvailabilitySlot[]> {
  const slots = await fetchAvailability(venueId, date, sportId, signal)
  const now = new Date()
  return slots.map((slot) => ({ ...slot, past: isPast(slot.startAt, now) }))
}

export function useAvailability(
  venueId: number,
  date: string,
  sportId: number,
  version: number,
): AsyncState<AvailabilitySlot[]> {
  return useAsync(`slots:${venueId}:${date}:${sportId}:${version}`, (signal) =>
    loadSlots(venueId, date, sportId, signal),
  )
}
