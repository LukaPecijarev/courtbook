export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const PRESS_KEYFRAMES = [{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }]
const PRESS_DURATION_MS = 240

export function playPress(element: Element) {
  if (prefersReducedMotion()) return
  element.animate(PRESS_KEYFRAMES, { duration: PRESS_DURATION_MS, easing: 'ease-out' })
}
