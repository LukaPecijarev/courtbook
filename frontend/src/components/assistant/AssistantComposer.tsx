import { useState, type FormEvent, type RefObject } from 'react'
import { assistant, MAX_MESSAGE_LENGTH } from '../../content/assistant'

interface AssistantComposerProps {
  inputRef: RefObject<HTMLInputElement | null>
  disabled: boolean
  onSend: (text: string) => void
}

export function AssistantComposer({ inputRef, disabled, onSend }: AssistantComposerProps) {
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
