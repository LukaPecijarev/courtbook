export interface SportTheme {
  id: string
  label: string
  color: string
  image: string
  landingImage: string
  backgroundImage: string
  venueImages: string[]
  icon: string
}

const BALL_OUTLINE = 'M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18z'

export const sportThemes: SportTheme[] = [
  {
    id: 'football',
    label: 'Football',
    color: '#2E7D32',
    image: '/images/sports/FootballBackgroundImage.webp',
    landingImage: '/images/landing/FootballLandingPage.webp',
    backgroundImage: '/images/sports/topView/FootballTopView.webp',
    venueImages: [
      '/images/sports/football/FootballCourt1.webp',
      '/images/sports/football/Footballcourt2.webp',
      '/images/sports/football/FootballCourt3.webp',
    ],
    icon: `${BALL_OUTLINE}M12 8l3.8 2.8-1.5 4.4H9.7l-1.5-4.4zM12 8V3.2M15.8 10.8l4.3-1.4M14.3 15.2l2.6 3.7M9.7 15.2l-2.6 3.7M8.2 10.8L3.9 9.4`,
  },
  {
    id: 'basketball',
    label: 'Basketball',
    color: '#F57C00',
    image: '/images/sports/BasketballBackgroundImage.webp',
    landingImage: '/images/landing/BasketballLandingPage.webp',
    backgroundImage: '/images/sports/topView/BasketballTopView.webp',
    venueImages: [
      '/images/sports/basketball/BasketballCourt1.webp',
      '/images/sports/basketball/BasketballCourt2.webp',
      '/images/sports/basketball/BasketballCourt3.webp',
    ],
    icon: `${BALL_OUTLINE}M12 3v18M3 12h18M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8`,
  },
  {
    id: 'tennis',
    label: 'Tennis',
    color: '#C0CA33',
    image: '/images/sports/TenisBackgroundImage.webp',
    landingImage: '/images/landing/TenisLandingPage.webp',
    backgroundImage: '/images/sports/topView/TenisTopView.webp',
    venueImages: [
      '/images/sports/tennis/TenisCourt1.webp',
      '/images/sports/tennis/TenisCourt2.webp',
      '/images/sports/tennis/TenisCourt3.webp',
    ],
    icon: `${BALL_OUTLINE}M5.6 5.8c3 2.8 3 9.6 0 12.4M18.4 5.8c-3 2.8-3 9.6 0 12.4`,
  },
  {
    id: 'padel',
    label: 'Padel',
    color: '#1E88E5',
    image: '/images/sports/PadelBackgroundImage.webp',
    landingImage: '/images/landing/PadelLandingPage.webp',
    backgroundImage: '/images/sports/topView/PadelTopView.webp',
    venueImages: [
      '/images/sports/padel/PadelCourt1.webp',
      '/images/sports/padel/PadelCourt2.webp',
      '/images/sports/padel/PadelCourt3.webp',
    ],
    icon: 'M10 3.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13zM14.6 14.6l5.6 5.6M8 8.5h.01M12 8.5h.01M10 11h.01M8 13.5h.01M12 13.5h.01',
  },
]

export function findSportTheme(id: string): SportTheme | undefined {
  return sportThemes.find((theme) => theme.id === id.toLowerCase())
}

export function neighbourSport(theme: SportTheme, steps: number): SportTheme {
  const count = sportThemes.length
  const index = sportThemes.indexOf(theme)
  return sportThemes[(((index + steps) % count) + count) % count]
}

export function neighbourImages(theme: SportTheme): string[] {
  return [-1, 1].flatMap((steps) => {
    const sport = neighbourSport(theme, steps)
    return [sport.image, sport.backgroundImage, ...sport.venueImages]
  })
}

export function sportDistance(from: SportTheme, to: SportTheme): number {
  const count = sportThemes.length
  const forward = (sportThemes.indexOf(to) - sportThemes.indexOf(from) + count) % count
  return forward > count / 2 ? forward - count : forward
}

export function venueImageFor(theme: SportTheme, position: number): string {
  return theme.venueImages[position % theme.venueImages.length] ?? theme.image
}
