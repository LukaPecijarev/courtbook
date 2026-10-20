import type { MouseEvent } from 'react'
import type { VenueResponse } from '../api/venues'
import { pricing } from '../content/sportPage'

export function classNames(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}

export function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const PRESS_KEYFRAMES = [{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }]
const PRESS_DURATION_MS = 240

export function playPress(element: Element) {
  if (prefersReducedMotion()) return
  element.animate(PRESS_KEYFRAMES, { duration: PRESS_DURATION_MS, easing: 'ease-out' })
}

const numberFormat = new Intl.NumberFormat('en-US')

export function formatPrice(amount: number): string {
  return `${numberFormat.format(amount)} ${pricing.currency}`
}

export function formatPricePerHour(pricePerHour: number): string {
  return `${formatPrice(pricePerHour)} ${pricing.perHour}`
}

export function venueLocation(venue: VenueResponse): string {
  return [venue.address, venue.city].filter(Boolean).join(', ')
}
