import { matchPath, useLocation } from 'react-router-dom'
import { findSportTheme, type SportTheme } from '../config/sportThemes'

const DEFAULT_SPORT_ID = 'tennis'

/** The sport the visitor is looking at: from /sports/:sportId, or ?sport= on venue pages; tennis otherwise. */
export function useCurrentSportTheme(): SportTheme {
  const { pathname, search } = useLocation()
  const fromPath = matchPath('/sports/:sportId/*', pathname)?.params.sportId
  const fromQuery = new URLSearchParams(search).get('sport')
  const requested = fromPath ?? fromQuery
  return (requested && findSportTheme(requested)) || findSportTheme(DEFAULT_SPORT_ID)!
}
