import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { ApiError } from '../../api/client'
import { createBooking, type VenueResponse } from '../../api/venues'
import { bookingForm } from '../../content/venuePage'
import { formatLongDate, formatTime } from '../../utils/date'
import { formatPricePerHour } from '../../utils/ui'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME_LENGTH = 100

type Status = 'editing' | 'submitting' | 'success' | 'conflict' | 'error'

interface FieldErrors {
  name?: string
  email?: string
}

function validate(name: string, email: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!name.trim()) errors.name = bookingForm.nameRequired
  else if (name.trim().length > MAX_NAME_LENGTH) errors.name = bookingForm.nameTooLong
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = bookingForm.emailInvalid
  return errors
}

interface BookingDialogProps {
  venue: VenueResponse
  sportId: number
  startAt: string
  onClose: () => void
  onAvailabilityChanged: () => void
}

export function BookingDialog({ venue, sportId, startAt, onClose, onAvailabilityChanged }: BookingDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('editing')
  const nameInput = useRef<HTMLInputElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const submitting = status === 'submitting'

  useEffect(() => {
    const opener = document.activeElement
    nameInput.current?.focus()
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const fieldErrors = validate(name, email)
    setErrors(fieldErrors)
    if (fieldErrors.name) return nameInput.current?.focus()
    if (fieldErrors.email) return emailInput.current?.focus()

    setStatus('submitting')
    try {
      await createBooking(venue.id, { sportId, startAt, customerName: name.trim(), customerEmail: email.trim() })
      setStatus('success')
      onAvailabilityChanged()
    } catch (error) {
      const conflict = error instanceof ApiError && error.status === 409
      setStatus(conflict ? 'conflict' : 'error')
      if (conflict) onAvailabilityChanged()
    }
  }

  const summary = `${venue.name} · ${formatLongDate(startAt)} · ${formatTime(startAt)} · ${formatPricePerHour(venue.pricePerHour)}`

  return (
    <div className="booking-dialog" onClick={(event) => event.target === event.currentTarget && !submitting && onClose()}>
      <Card
        className="booking-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        data-cursor-accent
      >
        <button type="button" className="booking-dialog__close" aria-label={bookingForm.close} onClick={onClose} disabled={submitting}>
          ×
        </button>
        <SectionTitle id="booking-dialog-title" size="sm">
          {status === 'success' ? bookingForm.successTitle : bookingForm.title}
        </SectionTitle>
        <p className="booking-dialog__summary">{summary}</p>

        {status === 'success' || status === 'conflict' ? (
          <div className="booking-dialog__result">
            {status === 'success' && (
              <p className="booking-dialog__success" role="status">
                {bookingForm.successText}
              </p>
            )}
            {status === 'conflict' && (
              <p className="booking-dialog__alert" role="alert">
                {bookingForm.conflict}
              </p>
            )}
            <Button label={bookingForm.done} onClick={onClose} />
          </div>
        ) : (
          <form className="booking-dialog__form" onSubmit={handleSubmit} noValidate>
            <Field
              id="booking-name"
              label={bookingForm.name}
              value={name}
              onChange={setName}
              error={errors.name}
              inputRef={nameInput}
              autoComplete="name"
              maxLength={MAX_NAME_LENGTH}
            />
            <Field
              id="booking-email"
              label={bookingForm.email}
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              inputRef={emailInput}
              autoComplete="email"
            />
            {status === 'error' && (
              <p className="booking-dialog__alert" role="alert">
                {bookingForm.error}
              </p>
            )}
            <Button
              type="submit"
              label={submitting ? bookingForm.submitting : bookingForm.submit}
              withArrow
              disabled={submitting}
            />
          </form>
        )}
      </Card>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  inputRef: RefObject<HTMLInputElement | null>
  type?: 'text' | 'email'
  autoComplete: string
  maxLength?: number
}

function Field({ id, label, value, onChange, error, inputRef, type = 'text', autoComplete, maxLength }: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="booking-dialog__field">
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="booking-dialog__error">
          {error}
        </p>
      )}
    </div>
  )
}
