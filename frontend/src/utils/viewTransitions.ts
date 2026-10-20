import { prefersReducedMotion } from './motion'

const MORPH_SELECTOR = '[data-morph]'
const MORPH_DURATION_MS = 420
const MORPH_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const TRANSITIONING_CLASS = 'is-transitioning'

let active: ViewTransition | null = null

export function morphProps(name: string) {
  return { 'data-morph': name, style: { viewTransitionName: name } }
}

export function isViewTransitionActive(): boolean {
  return active !== null
}

export function afterViewTransition(): Promise<void> {
  return active ? active.finished.then(noop, noop) : Promise.resolve()
}

function noop() {}

function morphRects(): Map<string, DOMRect> {
  const rects = new Map<string, DOMRect>()
  document.querySelectorAll<HTMLElement>(MORPH_SELECTOR).forEach((element) => {
    if (element.dataset.morph) rects.set(element.dataset.morph, element.getBoundingClientRect())
  })
  return rects
}

function morphWithTransforms(from: Map<string, DOMRect>) {
  if (prefersReducedMotion()) return
  for (const [name, to] of morphRects()) {
    const start = from.get(name)
    if (!start) continue
    const pseudoElement = `::view-transition-group(${name})`
    document
      .getAnimations()
      .filter((animation) => (animation.effect as KeyframeEffect | null)?.pseudoElement === pseudoElement)
      .forEach((animation) => animation.cancel())
    const scale = `scale(${start.width / to.width}, ${start.height / to.height})`
    document.documentElement.animate(
      {
        transformOrigin: ['0 0', '0 0'],
        transform: [`translate(${start.left}px, ${start.top}px) ${scale}`, `translate(${to.left}px, ${to.top}px)`],
      },
      { duration: MORPH_DURATION_MS, easing: MORPH_EASING, pseudoElement, fill: 'both' },
    )
  }
}

export function trackViewTransitions() {
  if (typeof document.startViewTransition !== 'function') return
  const start = document.startViewTransition.bind(document)
  document.startViewTransition = ((update) => {
    const from = morphRects()
    const transition = start(update)
    active = transition
    document.documentElement.classList.add(TRANSITIONING_CLASS)
    transition.ready.then(() => morphWithTransforms(from), noop)
    transition.finished
      .catch(noop)
      .finally(() => {
        if (active !== transition) return
        active = null
        document.documentElement.classList.remove(TRANSITIONING_CLASS)
      })
    return transition
  }) as Document['startViewTransition']
}
