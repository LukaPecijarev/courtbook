import { Link } from 'react-router-dom'
import { sectionLinks } from '../../content/landing'
import { SectionLink } from '../SectionLink'
import './LandingFooter.css'

const CURRENT_YEAR = new Date().getFullYear()

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <span className="landing-footer__brand">courtbook</span>
      <nav aria-label="Page sections">
        <ul className="landing-footer__links">
          {sectionLinks.map((link) => (
            <li key={link.label}>
              {'to' in link ? (
                <Link to={link.to} viewTransition>
                  {link.label}
                </Link>
              ) : (
                <SectionLink section={link.section}>{link.label}</SectionLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <p className="landing-footer__copyright">
        © {CURRENT_YEAR} courtbook. All rights reserved.
      </p>
    </footer>
  )
}
