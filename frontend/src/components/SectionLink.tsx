import type { MouseEvent, ReactNode } from 'react'
import { scrollToSection } from '../utils/scroll'
import { isPlainClick, playPress } from '../utils/ui'

interface SectionLinkProps {
  section: string
  className?: string
  children: ReactNode
}

export function SectionLink({ section, className, children }: SectionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(section)
    if (!target || !isPlainClick(event)) return
    event.preventDefault()
    playPress(event.currentTarget)
    scrollToSection(target)
  }

  return (
    <a href={`#${section}`} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
