import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigationType, useViewTransitionState } from 'react-router-dom'
import { pageKey } from '../utils/paths'

type Entry = 'fade' | 'transition'

const scrollPositions = new Map<string, number>()

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const key = pageKey(location.pathname)
  const viaViewTransition = useViewTransitionState(location.pathname)
  const [page, setPage] = useState({ key, navigated: false })
  if (page.key !== key) setPage({ key, navigated: true })

  useLayoutEffect(() => {
    const save = () => scrollPositions.set(location.key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [location.key])

  const entry: Entry | undefined = page.navigated ? (viaViewTransition ? 'transition' : 'fade') : undefined
  const scrollTop = navigationType === 'POP' ? (scrollPositions.get(location.key) ?? 0) : 0
  return (
    <PageEnter key={key} entry={entry} scrollTop={scrollTop}>
      {children}
    </PageEnter>
  )
}

interface PageEnterProps {
  entry?: Entry
  scrollTop: number
  children: ReactNode
}

function PageEnter({ entry, scrollTop, children }: PageEnterProps) {
  const [arrival] = useState({ entry, scrollTop })

  useLayoutEffect(() => {
    if (arrival.entry) window.scrollTo({ top: arrival.scrollTop, behavior: 'instant' })
  }, [arrival])

  return (
    <div className="page-transition" data-entry={arrival.entry}>
      {children}
    </div>
  )
}
