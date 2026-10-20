function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function nextDays(count: number, from: Date = new Date()): Date[] {
  return Array.from(
    { length: count },
    (_, offset) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset),
  )
}

export function formatTime(localDateTime: string): string {
  return localDateTime.slice(11, 16)
}

export function isPast(localDateTime: string, now: Date = new Date()): boolean {
  return new Date(localDateTime) <= now
}

const weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long' })
const monthYearFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const longDateFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

export function formatWeekday(date: Date): string {
  return weekdayFormat.format(date)
}

export function formatMonthRange(first: Date, last: Date): string {
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return monthYearFormat.format(first)
  }
  if (first.getFullYear() === last.getFullYear()) {
    return `${monthFormat.format(first)} – ${monthYearFormat.format(last)}`
  }
  return `${monthYearFormat.format(first)} – ${monthYearFormat.format(last)}`
}

export function formatLongDate(localDateTime: string): string {
  return longDateFormat.format(new Date(localDateTime))
}
