import { DEFAULT_SPORT_PATH } from '../utils/paths'

export interface LandingSport {
  sportId: string
  brief: string
}

export type LandingLink = { label: string } & ({ section: string } | { to: string })

export const hero = {
  image: '/images/landing/LandingPageFirstImage.webp',
  headline: 'Your court is waiting.',
  subline: 'Football, basketball, tennis and padel courts across Skopje, booked in a minute.',
}

export const landingSports: LandingSport[] = [
  {
    sportId: 'football',
    brief:
      'Get your team together and book a pitch for the hour that suits you. Pick a venue, choose a free slot and the field is yours.',
  },
  {
    sportId: 'basketball',
    brief:
      'A court for a pickup game, a training session or a match with friends. See which hours are free and reserve the one you want.',
  },
  {
    sportId: 'tennis',
    brief:
      'Singles or doubles, morning or evening. Find a free court near you and book it with just your name and email.',
  },
  {
    sportId: 'padel',
    brief:
      'Fast, social and easy to pick up. Choose a padel court, pick your hour and invite three friends to play.',
  },
]

export const about = {
  title: 'About us',
  text: 'courtbook brings sports courts across Skopje together in one place. See each venue’s free hours and price per hour, then book a one-hour slot between 08:00 and 23:00 with just your name and email.',
}

export const reserve = {
  title: 'Ready to play?',
  text: 'Choose a sport, pick a venue and reserve your hour.',
  buttonLabel: 'Reserve a court',
  to: DEFAULT_SPORT_PATH,
}

export const contact = {
  label: 'Contact',
  email: 'info@courtbook.example',
  note: 'placeholder',
}

export const sectionLinks: LandingLink[] = [
  { label: 'Sports', to: DEFAULT_SPORT_PATH },
  { label: 'About us', section: 'about' },
  { label: 'Reserve', section: 'reserve' },
  { label: 'Contact', section: 'contact' },
]
