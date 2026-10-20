import { listingForm } from '../../content/ownerPage'

export function slotCount(dates: string[], startTimes: string[]): number {
  return dates.length * startTimes.length
}

export function validateSlots(dates: string[], startTimes: string[]) {
  return {
    dates: dates.length === 0 ? listingForm.datesRequired : undefined,
    startTimes: startTimes.length === 0 ? listingForm.hoursRequired : undefined,
  }
}
