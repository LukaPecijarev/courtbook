import { pricing } from '../content/sportPage'

const numberFormat = new Intl.NumberFormat('en-US')

export function formatPrice(amount: number): string {
  return `${numberFormat.format(amount)} ${pricing.currency}`
}

export function formatPricePerHour(pricePerHour: number): string {
  return `${formatPrice(pricePerHour)} ${pricing.perHour}`
}
