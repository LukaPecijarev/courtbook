import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from '../../utils/ui'
import { Card } from './Card'

const LEAVE_FALLBACK_MS = 300

interface DialogProps {
  labelledBy: string
  onClose: () => void
  /** False while a request runs: Escape and backdrop clicks are ignored. */
  dismissible?: boolean
  /** Set to play the leave animation; onLeft runs when it has finished. */
  leaving?: boolean
  onLeft?: () => void
  children: ReactNode
}

/** Native modal dialog: focus stays inside, Escape closes it, and so does a click on the backdrop. */
export function Dialog({ labelledBy, onClose, dismissible = true, leaving = false, onLeft, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const latestOnLeft = useRef(onLeft)

  useLayoutEffect(() => {
    latestOnLeft.current = onLeft
  })

  // No close() on cleanup: in StrictMode the effect re-runs, and the queued 'close' event would
  // unmount the dialog right after it opened. Removing the element already leaves the top layer.
  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    const dialog = ref.current
    if (!leaving || !dialog) return
    let done = false
    const finish = () => {
      if (done) return
      done = true
      latestOnLeft.current?.()
    }
    if (prefersReducedMotion()) {
      finish()
      return
    }
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === dialog) finish()
    }
    const timeout = setTimeout(finish, LEAVE_FALLBACK_MS)
    dialog.addEventListener('animationend', onAnimationEnd)
    return () => {
      clearTimeout(timeout)
      dialog.removeEventListener('animationend', onAnimationEnd)
    }
  }, [leaving])

  return (
    <dialog
      ref={ref}
      className="dialog"
      data-state={leaving ? 'leaving' : undefined}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        if (!dismissible || leaving) event.preventDefault()
      }}
      onClose={() => {
        if (!ref.current?.open) onClose()
      }}
      onClick={(event) => dismissible && !leaving && event.target === event.currentTarget && onClose()}
    >
      <Card className="dialog__panel" data-cursor-accent>
        {children}
      </Card>
    </dialog>
  )
}
