import type { SportTheme } from '../config/sportThemes'

interface SportIconProps {
  theme: SportTheme
  size?: number
}

export function SportIcon({ theme, size = 22 }: SportIconProps) {
  return (
    <svg className="sport-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={theme.icon} />
    </svg>
  )
}
