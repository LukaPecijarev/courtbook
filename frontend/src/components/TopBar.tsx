import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { sportThemes, type SportTheme } from '../config/sportThemes'
import { topBar } from '../content/sportPage'
import { venuePage } from '../content/venuePage'
import { useSportCarousel } from '../hooks/useSportCarousel'
import { sportPath } from '../utils/paths'
import { isPlainClick } from '../utils/ui'
import { SportIcon } from './SportIcon'
import { Card } from './ui/Card'

interface TopBarProps {
  sport?: SportTheme
  overlay?: boolean
}

export function TopBar({ sport, overlay = false }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { current, goTo } = useSportCarousel()
  const menuButton = useRef<HTMLButtonElement>(null)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButton.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const openSport = (event: MouseEvent, theme: SportTheme) => {
    closeMenu()
    if (!isPlainClick(event)) return
    event.preventDefault()
    goTo(theme)
  }

  const menuStyle = { '--count': sportThemes.length } as CSSProperties
  const itemStyle = (index: number) => ({ '--i': index }) as CSSProperties

  return (
    <header className={`top-bar${overlay ? ' top-bar--overlay' : ''}`} data-cursor-neutral>
      {sport ? (
        <Link
          to={sportPath(sport)}
          className="top-bar__icon-link"
          aria-label={`${venuePage.backToSport} ${sport.label}`}
          viewTransition
        >
          <SportIcon theme={sport} />
        </Link>
      ) : (
        <Link to="/" className="top-bar__link top-bar__home" viewTransition>
          {topBar.home}
        </Link>
      )}
      <button
        ref={menuButton}
        type="button"
        className="top-bar__menu-button"
        aria-label={menuOpen ? topBar.closeMenu : topBar.openMenu}
        aria-expanded={menuOpen}
        aria-controls="top-bar-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <Card as="nav" id="top-bar-menu" className="top-bar__menu" data-state={menuOpen ? 'open' : undefined} style={menuStyle}>
        {sportThemes.map((theme, index) => (
          <Link
            key={theme.id}
            to={sportPath(theme)}
            className="top-bar__link top-bar__menu-item"
            style={itemStyle(index)}
            aria-current={theme === current ? 'page' : undefined}
            onClick={(event) => openSport(event, theme)}
          >
            {theme.label}
          </Link>
        ))}
      </Card>
    </header>
  )
}
