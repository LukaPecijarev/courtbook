import { prefersReducedMotion } from './ui'

function pinnedHeaderHeight(): number {
  const pinned = Array.from(document.querySelectorAll('header')).filter((header) =>
    ['fixed', 'sticky'].includes(getComputedStyle(header).position),
  )
  return Math.max(0, ...pinned.map((header) => header.getBoundingClientRect().height))
}

export function scrollToSection(section: Element) {
  const top = section.getBoundingClientRect().top + window.scrollY - pinnedHeaderHeight()
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
}
