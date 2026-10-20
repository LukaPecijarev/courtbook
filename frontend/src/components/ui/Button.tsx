import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { accentStyle } from '../../utils/color'

interface CommonProps {
  label: string
  accent?: string
  fillFrom?: 'left' | 'right'
  withArrow?: boolean
  quiet?: boolean
}

interface LinkProps extends CommonProps {
  to: string
  state?: unknown
  viewTransition?: boolean
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

interface ButtonProps extends CommonProps {
  to?: undefined
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
}

export function Button(props: LinkProps | ButtonProps) {
  const { label, accent, fillFrom = 'left', withArrow = false, quiet = false } = props
  const shared = {
    className: 'btn',
    style: accent ? accentStyle(accent) : undefined,
    'data-fill': fillFrom,
    'data-arrow': withArrow || undefined,
    'data-quiet': quiet || undefined,
  }
  const content = (
    <>
      <span>{label}</span>
      {withArrow && (
        <span data-icon aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
          </svg>
        </span>
      )}
    </>
  )

  if (props.to !== undefined) {
    return (
      <Link to={props.to} state={props.state} viewTransition={props.viewTransition} onClick={props.onClick} {...shared}>
        {content}
      </Link>
    )
  }
  return (
    <button type={props.type ?? 'button'} disabled={props.disabled} onClick={props.onClick} {...shared}>
      {content}
    </button>
  )
}
