import { about, contact, reserve } from '../../content/landing'
import { Reveal } from '../Reveal'
import { Button } from '../ui/Button'
import { SectionTitle } from '../ui/SectionTitle'
import { LandingFooter } from './LandingFooter'
import './Finale.css'

const RESERVE_ACCENT = '#F4EFE6'

export function Finale() {
  return (
    <div className="finale" data-cursor-neutral>
      <section id="finale" className="finale__content" aria-label="About and reservations">
        <Reveal id="about">
          <SectionTitle size="md">{about.title}</SectionTitle>
          <p className="finale__about-text">{about.text}</p>
        </Reveal>
        <div id="reserve" className="finale__reserve">
          <Reveal>
            <SectionTitle size="md">{reserve.title}</SectionTitle>
            <p>{reserve.text}</p>
          </Reveal>
          <Button to={reserve.to} label={reserve.buttonLabel} accent={RESERVE_ACCENT} viewTransition />
          <Reveal id="contact" className="finale__contact">
            <span className="finale__contact-label">{contact.label}</span>
            <span className="finale__contact-email">{contact.email}</span>
            <span className="finale__contact-note">({contact.note})</span>
          </Reveal>
        </div>
      </section>
      <LandingFooter />
    </div>
  )
}
