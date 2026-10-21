export const MAX_MESSAGE_LENGTH = 500

export const assistant = {
  title: 'Court assistant',
  subtitle: 'Online · Powered by Claude',
  open: 'Open the court assistant',
  close: 'Close chat',
  clear: 'Clear chat',
  send: 'Send message',
  typing: 'Асистентот пишува',
  placeholder: 'Прашајте за термини...',
  greeting: 'Добредојдовте! Прашајте ме за слободни термини, спортови или денови. Како можам да ви помогнам?',
  nextFree: (sport: string, when: string) => `Следниот слободен термин за ${sport} е ${when}.`,
  noNextFree: (sport: string) => `Нема слободни термини за ${sport} во следните 30 дена.`,
  freeOn: (sport: string, day: string) => `Слободни термини за ${sport} ${day}:`,
  noneOn: (sport: string, day: string) => `Нема слободни термини за ${sport} ${day}.`,
  more: (count: number) => `и уште ${count}.`,
  today: 'денес',
  tomorrow: 'утре',
  evening: 'вечер',
  perHour: 'ден. / ч',
  tooManyMessages: 'Испративте премногу пораки. Обидете се повторно за еден час.',
  unavailable: 'Асистентот моментално не е достапен. Обидете се подоцна.',
  failed: 'Извинете, имаше проблем. Обидете се повторно.',
}

/** Browsers often ship without Macedonian date data, so the names are kept here. */
export const weekdays = ['недела', 'понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота']
export const months = [
  'јануари', 'февруари', 'март', 'април', 'мај', 'јуни',
  'јули', 'август', 'септември', 'октомври', 'ноември', 'декември',
]

/** Sport names in Macedonian, keyed by sport theme id. */
export const sportNames: Record<string, string> = {
  football: 'фудбал',
  basketball: 'кошарка',
  tennis: 'тенис',
  padel: 'падел',
}

export interface QuickChip {
  label: string
  type: 'next-free' | 'free-on-date'
  /** Days from today; only for free-on-date. */
  dayOffset?: number
  /** Theme id of a fixed sport; the current sport when left out. */
  sport?: string
  /** Earliest start hour shown. */
  fromHour?: number
}

export const EVENING_FROM_HOUR = 17

export const quickChips: QuickChip[] = [
  { label: 'Следен слободен термин', type: 'next-free' },
  { label: 'Слободни терени утре', type: 'free-on-date', dayOffset: 1 },
  { label: 'Слободни термини за падел вечер', type: 'free-on-date', dayOffset: 0, sport: 'padel', fromHour: EVENING_FROM_HOUR },
]
