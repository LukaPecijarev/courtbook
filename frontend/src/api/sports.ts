import { getJson } from './client'

export interface SportResponse {
  id: number
  name: string
  color: string
  imageUrl: string | null
}

export function fetchSports(signal?: AbortSignal): Promise<SportResponse[]> {
  return getJson<SportResponse[]>('/sports', signal)
}
