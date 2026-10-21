import { Link } from 'react-router-dom'
import type { ChatMessage } from '../../hooks/useAssistantChat'
import { assistant } from '../../content/assistant'
import { formatTime } from '../../utils/date'

export function ChatBubble({ message }: { message: ChatMessage }) {
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
