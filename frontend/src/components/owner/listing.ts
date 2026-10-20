import type { VenueListing, VenueResponse } from '../../api/venues'
import { listingForm } from '../../content/ownerPage'

export const NAME_MAX = 80
export const DESCRIPTION_MAX = 400
export const IMAGE_URL_MAX = 500

export interface ListingValues {
  name: string
  description: string
  pricePerHour: string
  imageUrl: string
}

export type ListingErrors = Partial<Record<keyof ListingValues, string>>

export const EMPTY_LISTING: ListingValues = { name: '', description: '', pricePerHour: '', imageUrl: '' }

export function listingValuesOf(venue: VenueResponse): ListingValues {
  return {
    name: venue.name,
    description: venue.description ?? '',
    pricePerHour: String(Math.round(venue.pricePerHour)),
    imageUrl: venue.imageUrl ?? '',
  }
}

export function validateListing(values: ListingValues): ListingErrors {
  const errors: ListingErrors = {}
  if (!values.name.trim()) errors.name = listingForm.nameRequired
  if (!values.description.trim()) errors.description = listingForm.descriptionRequired
  if (!/^\d+$/.test(values.pricePerHour.trim()) || Number(values.pricePerHour) <= 0) {
    errors.pricePerHour = listingForm.priceInvalid
  }
  const imageUrl = values.imageUrl.trim()
  if (imageUrl && !/^https:\/\/\S+$/i.test(imageUrl)) errors.imageUrl = listingForm.imageUrlInvalid
  return errors
}

export function toListing(values: ListingValues): VenueListing {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    pricePerHour: Number(values.pricePerHour.trim()),
    imageUrl: values.imageUrl.trim() || null,
  }
}

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean)
}
