import { useEffect, useRef } from 'react'

const ACCENT_SELECTOR = '[data-cursor-accent]'
const NEUTRAL_SELECTOR = '[data-cursor-neutral]'
const POINTER_SELECTOR = 'a[href], button:not(:disabled), [role="button"], [data-cursor="pointer"]'

function readAccent(element: Element): string {
  return getComputedStyle(element).getPropertyValue('--accent')
}

/**
 * Modal dialogs live in the browser's top layer, above any z-index. The cursor is a manual popover, so it
 * lives there too; re-showing it moves it above the most recently opened dialog.
 */
function raiseToTopLayer(cursor: HTMLElement) {
  if (cursor.matches(':popover-open')) cursor.hidePopover()
  cursor.showPopover()
}

function cursorStateFor(target: EventTarget | null): 'pointer' | 'arrow' {
  return target instanceof Element && target.closest(POINTER_SELECTOR) ? 'pointer' : 'arrow'
}

export function AccentCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor || !window.matchMedia('(pointer: fine)').matches) return

    raiseToTopLayer(cursor)
    const pointer = { x: 0, y: 0 }
    const blocksInView: Element[] = []
    let frame = 0

    const pickBlock = (target: Element | null) => {
      const hovered = target?.closest(ACCENT_SELECTOR)
      return hovered && blocksInView.includes(hovered) ? hovered : blocksInView.at(-1)
    }

    const render = () => {
      frame = 0
      cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
      const target = document.elementFromPoint(pointer.x, pointer.y)
      const block = target?.closest(NEUTRAL_SELECTOR) ? undefined : pickBlock(target)
      if (block) cursor.style.setProperty('--accent', readAccent(block))
      else cursor.style.removeProperty('--accent')
    }

    const scheduleRender = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }

    const handlePointerPosition = (event: MouseEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      cursor.classList.add('is-visible')
      scheduleRender()
    }

    const handleMouseLeave = () => cursor.classList.remove('is-visible')

    const handlePointerOver = (event: PointerEvent) => {
      cursor.dataset.state = cursorStateFor(event.target)
    }

    const handlePointerOut = (event: PointerEvent) => {
      cursor.dataset.state = cursorStateFor(event.relatedTarget)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = blocksInView.indexOf(entry.target)
          if (index !== -1) blocksInView.splice(index, 1)
          if (entry.intersectionRatio >= 0.5) blocksInView.push(entry.target)
        }
        scheduleRender()
      },
      { threshold: 0.5 },
    )
    const observeAccentElements = () =>
      document.querySelectorAll(ACCENT_SELECTOR).forEach((element) => observer.observe(element))
    observeAccentElements()
    const mutations = new MutationObserver((records) => {
      observeAccentElements()
      if (records.some((record) => record.type === 'attributes')) raiseToTopLayer(cursor)
    })
    mutations.observe(document.body, { childList: true, subtree: true, attributeFilter: ['open'] })

    const root = document.documentElement
    window.addEventListener('mousemove', handlePointerPosition)
    window.addEventListener('scroll', scheduleRender, { passive: true })
    root.addEventListener('mouseenter', handlePointerPosition)
    root.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('pointerover', handlePointerOver)
    document.addEventListener('pointerout', handlePointerOut)

    return () => {
      observer.disconnect()
      mutations.disconnect()
      if (cursor.matches(':popover-open')) cursor.hidePopover()
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', handlePointerPosition)
      window.removeEventListener('scroll', scheduleRender)
      root.removeEventListener('mouseenter', handlePointerPosition)
      root.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('pointerover', handlePointerOver)
      document.removeEventListener('pointerout', handlePointerOut)
    }
  }, [])

  return (
    <div ref={cursorRef} className="accent-cursor" data-state="arrow" popover="manual" aria-hidden="true">
      <svg className="accent-cursor__shape accent-cursor__arrow" viewBox="0 0 16 22" width="16" height="22">
        <path d="M1.25 1.25v16.9l4.2-4 2.8 6.2 2.8-1.2-2.7-6h5.6z" />
      </svg>
      <svg className="accent-cursor__shape accent-cursor__hand" viewBox="0 0 18 22" width="18" height="22">
        <path d="M5 2.75a1.5 1.5 0 0 1 3 0V9a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0v1a1.25 1.25 0 0 1 2.5 0v4.5c0 3-2 5.25-5 5.25h-2c-2 0-3.2-.95-4.2-2.45L2 13.6a1.4 1.4 0 0 1 2.1-1.8l.9 1z" />
      </svg>
    </div>
  )
}
