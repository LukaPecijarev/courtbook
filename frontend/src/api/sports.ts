import { getJson } from './client'

export interface SportResponse {
  id: number
  name: string
  color: string
}

let sportsRequest: Promise<SportResponse[]> | null = null

function loadSports(): Promise<SportResponse[]> {
  sportsRequest ??= getJson<SportResponse[]>('/sports').catch((error: unknown) => {
    sportsRequest = null
    throw error
  })
  return sportsRequest
}

export async function findSportByThemeId(themeId: string): Promise<SportResponse | undefined> {
  const sports = await loadSports()
  return sports.find((sport) => sport.name.toLowerCase() === themeId)
}
