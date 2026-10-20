import type { CSSProperties } from 'react'
import { hero } from '../../content/landing'
import './Hero.css'

export function Hero() {
  const style = { '--hero-image': `url(${hero.image})` } as CSSProperties

  return (
    <header className="hero" style={style}>
      <span className="hero__brand">courtbook</span>
      <div className="hero__content">
        <h1 className="hero__headline">{hero.headline}</h1>
        <p className="hero__subline">{hero.subline}</p>
      </div>
      <a href="#sports" className="hero__scroll">
        <span>Scroll</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </header>
  )
}
