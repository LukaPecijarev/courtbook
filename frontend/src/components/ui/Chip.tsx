import type { ButtonHTMLAttributes } from 'react'
import { classNames } from '../../utils/ui'

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  selected?: boolean
}

export function Chip({ selected = false, disabled = false, className, ...rest }: ChipProps) {
  const state = disabled ? 'disabled' : selected ? 'selected' : 'default'
  return (
    <button
      type="button"
      className={classNames('chip', className)}
      data-state={state}
      disabled={disabled}
      aria-pressed={selected}
      {...rest}
    />
  )
}
