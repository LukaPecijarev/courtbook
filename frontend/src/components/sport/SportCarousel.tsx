import { memo, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type TransitionEvent } from 'react'
import { neighbourSport, sportDistance, sportThemes, type SportTheme } from '../../config/sportThemes'
import { carousel } from '../../content/sportPage'
import { useSportCarousel, type Direction } from '../../hooks/useSportCarousel'
import { prefersReducedMotion } from '../../utils/ui'
import './SportCarousel.css'

const REACH = Math.floor(sportThemes.length / 2) + 1
const OFFSETS = Array.from({ length: REACH * 2 + 1 }, (_, index) => index - REACH)
const SWIPE_THRESHOLD_PX = 40

function isEditable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

interface Track {
  base: SportTheme
  seen: SportTheme
  sliding: boolean
}

interface SportCarouselProps {
  theme: SportTheme
}

export const SportCarousel = memo(function SportCarousel({ theme }: SportCarouselProps) {
  const { step } = useSportCarousel()
  const [track, setTrack] = useState<Track>({ base: theme, seen: theme, sliding: false })
  const swipeStartX = useRef<number | null>(null)

  if (track.seen !== theme) {
    const instant = prefersReducedMotion()
    setTrack({ base: instant ? theme : track.base, seen: theme, sliding: !instant })
  }
  const shift = sportDistance(track.base, theme)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isEditable(event.target)) return
      if (event.key === 'ArrowLeft') step(-1)
      if (event.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === 'transform') {
      setTrack({ base: theme, seen: theme, sliding: false })
    }
  }

  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') swipeStartX.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent) => {
    if (swipeStartX.current === null) return
    const distance = event.clientX - swipeStartX.current
    swipeStartX.current = null
    if (Math.abs(distance) > SWIPE_THRESHOLD_PX) step(distance < 0 ? 1 : -1)
  }

  const trackStyle = { '--reach': REACH, '--shift': shift } as CSSProperties

  return (
    <section className="sport-carousel" aria-roledescription="carousel" aria-label={carousel.label} data-cursor-accent>
      <div
        className="sport-carousel__viewport"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (swipeStartX.current = null)}
      >
        <div
          className="sport-carousel__track"
          data-state={track.sliding ? 'sliding' : undefined}
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {OFFSETS.map((offset) => {
            const sport = neighbourSport(track.base, offset)
            const isCurrent = offset === shift
            const Title = isCurrent ? 'h1' : 'p'
            const peekDirection = offset - shift
            const isPeek = peekDirection === -1 || peekDirection === 1
            return (
              <div
                key={offset}
                className="sport-carousel__slide"
                data-state={isCurrent ? 'current' : undefined}
                style={{ '--slide-image': `url(${sport.image})` } as CSSProperties}
                aria-hidden={!isCurrent}
                data-cursor={isPeek ? 'pointer' : undefined}
                onClick={isPeek ? () => step(peekDirection) : undefined}
              >
                <Title className="sport-carousel__title">{sport.label}</Title>
              </div>
            )
          })}
        </div>
      </div>
      <CarouselArrow direction={-1} label={`${carousel.previous}: ${neighbourSport(theme, -1).label}`} onClick={() => step(-1)} />
      <CarouselArrow direction={1} label={`${carousel.next}: ${neighbourSport(theme, 1).label}`} onClick={() => step(1)} />
    </section>
  )
})

interface CarouselArrowProps {
  direction: Direction
  label: string
  onClick: () => void
}

function CarouselArrow({ direction, label, onClick }: CarouselArrowProps) {
  const side = direction < 0 ? 'previous' : 'next'
  return (
    <button type="button" className={`sport-carousel__arrow sport-carousel__arrow--${side}`} aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d={direction < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}
