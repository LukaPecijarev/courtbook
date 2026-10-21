import { useCallback, useRef, useState } from 'react'
import { fetchQuickAnswer, sendAssistantMessage, type FreeSlot } from '../api/assistant'
import { ApiError } from '../api/client'
import { findSportByThemeId } from '../api/sports'
import { findSportTheme, type SportTheme } from '../config/sportThemes'
import { assistant, sportNames, type QuickChip } from '../content/assistant'
import { formatMacedonianDate, formatTime, nextDays, toIsoDate } from '../utils/date'

const SHOWN_SLOTS = 6

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
  slots?: FreeSlot[]
  /** Sport used for the slot links. */
  sport?: SportTheme
  note?: string
  isError?: boolean
}

const greeting: ChatMessage = { id: 0, role: 'assistant', text: assistant.greeting }

function errorText(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) return assistant.tooManyMessages
  if (error instanceof ApiError && error.status === 503) return assistant.unavailable
  return assistant.failed
}

function dayLabel(chip: QuickChip): string {
  const day = chip.dayOffset === 1 ? assistant.tomorrow : assistant.today
  return chip.fromHour === undefined ? day : `${day} ${assistant.evening}`
}

function startsFrom(slot: FreeSlot, fromHour: number | undefined): boolean {
  return fromHour === undefined || Number(formatTime(slot.startAt).slice(0, 2)) >= fromHour
}

async function answerChip(chip: QuickChip, current: SportTheme): Promise<Omit<ChatMessage, 'id' | 'role'>> {
  const sport = (chip.sport && findSportTheme(chip.sport)) || current
  const sportId = (await findSportByThemeId(sport.id))?.id
  if (sportId === undefined) throw new Error(`Unknown sport ${sport.id}`)
  const sportName = sportNames[sport.id] ?? sport.label

  if (chip.type === 'next-free') {
    const [slot] = await fetchQuickAnswer({ type: 'next-free', sportId })
    if (!slot) return { text: assistant.noNextFree(sportName) }
    const when = `${formatMacedonianDate(slot.startAt)}, ${formatTime(slot.startAt)}`
    return { text: assistant.nextFree(sportName, when), slots: [slot], sport }
  }

  const date = toIsoDate(nextDays((chip.dayOffset ?? 0) + 1).at(-1)!)
  const slots = (await fetchQuickAnswer({ type: 'free-on-date', sportId, date })).filter((slot) =>
    startsFrom(slot, chip.fromHour),
  )
  const day = dayLabel(chip)
  if (slots.length === 0) return { text: assistant.noneOn(sportName, day) }
  const hidden = slots.length - SHOWN_SLOTS
  return {
    text: assistant.freeOn(sportName, day),
    slots: slots.slice(0, SHOWN_SLOTS),
    sport,
    note: hidden > 0 ? assistant.more(hidden) : undefined,
  }
}

/** Chat state for the assistant. Nothing is persisted: a reload or clear starts again from the greeting. */
export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([greeting])
  const [loading, setLoading] = useState(false)
  const nextId = useRef(1)
  const conversation = useRef(0)

  const run = useCallback(async (question: string, answer: () => Promise<Omit<ChatMessage, 'id' | 'role'>>) => {
    const started = conversation.current
    const append = (message: Omit<ChatMessage, 'id'>) => {
      if (conversation.current !== started) return
      setMessages((previous) => [...previous, { ...message, id: nextId.current++ }])
    }
    append({ role: 'user', text: question })
    setLoading(true)
    try {
      append({ role: 'assistant', ...(await answer()) })
    } catch (error) {
      append({ role: 'assistant', text: errorText(error), isError: true })
    } finally {
      if (conversation.current === started) setLoading(false)
    }
  }, [])

  const send = useCallback(
    (text: string) => run(text, async () => ({ text: await sendAssistantMessage(text) })),
    [run],
  )

  const askChip = useCallback(
    (chip: QuickChip, current: SportTheme) => run(chip.label, () => answerChip(chip, current)),
    [run],
  )

  const clear = useCallback(() => {
    conversation.current += 1
    setLoading(false)
    setMessages([greeting])
  }, [])

  return { messages, loading, send, askChip, clear }
}
