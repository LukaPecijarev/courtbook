import type { ReactNode } from 'react'

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hint?: ReactNode
  error?: string
  multiline?: boolean
  disabled?: boolean
  type?: 'text' | 'url' | 'password'
  inputMode?: 'text' | 'numeric' | 'url'
  maxLength?: number
  placeholder?: string
  autoComplete?: string
}

export function Field({ id, label, value, onChange, hint, error, multiline = false, ...inputProps }: FieldProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  const shared = {
    id,
    value,
    disabled: inputProps.disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  }
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea {...shared} rows={4} maxLength={inputProps.maxLength} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input {...shared} {...inputProps} type={inputProps.type ?? 'text'} onChange={(event) => onChange(event.target.value)} />
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
