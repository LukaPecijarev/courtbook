import {
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { Link } from 'react-router-dom'
import { assistant, MAX_MESSAGE_LENGTH, quickChips } from '../../content/assistant'
import { useAssistantChat, type ChatMessage } from '../../hooks/useAssistantChat'
import { useCurrentSportTheme } from '../../hooks/useCurrentSportTheme'
import { accentStyle } from '../../utils/color'
import { formatTime } from '../../utils/date'
import { prefersReducedMotion } from '../../utils/ui'
import { SportIcon } from '../SportIcon'
import '../../styles/assistant.css'

const CLOSE_FALLBACK_MS = 400

type PanelState = 'closed' | 'open' | 'closing'

/** Floating court assistant: quick database answers from the chips, and free-text questions for Claude. */
export function AssistantWidget() {
  const sport = useCurrentSportTheme()
  const { messages, loading, send, askChip, clear } = useAssistantChat()
  const [state, setState] = useState<PanelState>('closed')
  const launcherRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  const close = () => setState(prefersReducedMotion() ? 'closed' : 'closing')

  useEffect(() => {
    if (state === 'open') inputRef.current?.focus()
    if (state === 'closed' && wasOpen.current) launcherRef.current?.focus()
    wasOpen.current = state !== 'closed'
    if (state !== 'closing') return
    const timer = window.setTimeout(() => setState('closed'), CLOSE_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => {
    const body = bodyRef.current
    body?.scrollTo({ top: body.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [messages, loading])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
  }

  const handleAnimationEnd = (event: AnimationEvent) => {
    if (event.target === event.currentTarget && state === 'closing') setState('closed')
  }

  if (state === 'closed') {
    return (
      <div className="assistant" style={accentStyle(sport.color)}>
        <button
          ref={launcherRef}
          type="button"
          className="assistant-launcher"
          aria-label={assistant.open}
          onClick={() => setState('open')}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8.5A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z" />
          </svg>
          <span className="assistant-dot" />
        </button>
      </div>
    )
  }

  return (
    <div className="assistant" style={accentStyle(sport.color)}>
      <section
        className="assistant-panel"
        data-state={state}
        aria-label={assistant.title}
        onKeyDown={handleKeyDown}
        onAnimationEnd={handleAnimationEnd}
      >
        <header className="assistant-header">
          <span className="assistant-avatar">
            <SportIcon theme={sport} size={20} />
            <span className="assistant-dot" />
          </span>
          <span className="assistant-header__titles">
            <strong>{assistant.title}</strong>
            <span>{assistant.subtitle}</span>
          </span>
          <button
            type="button"
            className="assistant-icon-button"
            data-tooltip={assistant.clear}
            aria-label={assistant.clear}
            onClick={clear}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l1 12.5h9L17.5 7M10 11v5M14 11v5" />
            </svg>
          </button>
          <button type="button" className="assistant-icon-button" aria-label={assistant.close} onClick={close}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div ref={bodyRef} className="assistant-body" aria-live="polite">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {messages.length === 1 && !loading && (
            <div className="assistant-chips">
              {quickChips.map((chip) => (
                <button key={chip.label} type="button" className="assistant-chip" onClick={() => askChip(chip, sport)}>
                  {chip.label}
                </button>
              ))}
            </div>
          )}
          {loading && (
            <div className="assistant-message" data-role="assistant">
              <p className="assistant-bubble assistant-typing" role="status" aria-label={assistant.typing}>
                <span />
                <span />
                <span />
              </p>
            </div>
          )}
        </div>

        <AssistantComposer inputRef={inputRef} disabled={loading} onSend={send} />
      </section>
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const { role, text, slots, sport, note, isError } = message
  return (
    <div className="assistant-message" data-role={role}>
      <p className="assistant-bubble" data-tone={isError ? 'error' : undefined}>
        {text}
      </p>
      {slots && sport && (
        <ul className="assistant-slots">
          {slots.map((slot) => (
            <li key={`${slot.venueId}:${slot.startAt}`}>
              <Link to={`/venues/${slot.venueId}?sport=${sport.id}`} className="assistant-slot">
                <span className="assistant-slot__time">{formatTime(slot.startAt)}</span>
                <span className="assistant-slot__venue">
                  <strong>{slot.venueName}</strong>
                  <span>
                    {slot.pricePerHour} {assistant.perHour}
                  </span>
                </span>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {note && <p className="assistant-note">{note}</p>}
    </div>
  )
}

interface AssistantComposerProps {
  inputRef: RefObject<HTMLInputElement | null>
  disabled: boolean
  onSend: (text: string) => void
}

function AssistantComposer({ inputRef, disabled, onSend }: AssistantComposerProps) {
  const [text, setText] = useState('')
  const message = text.trim()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!message || disabled) return
    onSend(message)
    setText('')
  }

  return (
    <form className="assistant-composer" onSubmit={submit}>
      <input
        ref={inputRef}
        className="assistant-composer__input"
        type="text"
        value={text}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder={assistant.placeholder}
        aria-label={assistant.placeholder}
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit" className="assistant-send" disabled={!message || disabled} aria-label={assistant.send}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
        </svg>
      </button>
    </form>
  )
}
