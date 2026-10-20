import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { findSportTheme, neighbourSport, type SportTheme } from '../config/sportThemes'
import { sportPath } from '../utils/paths'

export type Direction = -1 | 1

export function useSportCarousel() {
  const navigate = useNavigate()
  const { sportId } = useParams()
  const current = sportId ? findSportTheme(sportId) : undefined

  const goTo = useCallback(
    (sport: SportTheme) => {
      if (sport !== current) navigate(sportPath(sport))
    },
    [current, navigate],
  )

  const step = useCallback(
    (direction: Direction) => {
      if (current) goTo(neighbourSport(current, direction))
    },
    [current, goTo],
  )

  return { current, goTo, step }
}
