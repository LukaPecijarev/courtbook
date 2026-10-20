import { useEffect, useRef, useState } from 'react'
import { afterViewTransition, isViewTransitionActive } from '../utils/viewTransitions'

export function useInView<T extends Element>(rootMargin = '-10% 0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(isViewTransitionActive)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    })
    let cancelled = false
    afterViewTransition().then(() => {
      if (!cancelled) observer.observe(element)
    })
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [rootMargin])

  return { ref, inView }
}
