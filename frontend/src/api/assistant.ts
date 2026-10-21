import { getJson, postJson } from './client'

export interface FreeSlot {
  venueId: number
  venueName: string
  startAt: string
  pricePerHour: number
  sports: string[]
}

export type QuickQuestionType = 'next-free' | 'free-on-date'

export interface QuickQuestion {
  type: QuickQuestionType
  sportId?: number
  date?: string
}

export function fetchQuickAnswer({ type, sportId, date }: QuickQuestion): Promise<FreeSlot[]> {
  const params = new URLSearchParams({ type })
  if (sportId !== undefined) params.set('sportId', String(sportId))
  if (date) params.set('date', date)
  return getJson<FreeSlot[]>(`/assistant/quick?${params}`)
}

export async function sendAssistantMessage(message: string): Promise<string> {
  const { reply } = await postJson<{ reply: string }>('/assistant/message', { message })
  return reply
}
