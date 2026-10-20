interface VenueDetails {
  surface: string
  amenities: string[]
  badge?: string
}

const defaultDetails: VenueDetails = {
  surface: 'Ground',
  amenities: [],
}

const venueDetails: Record<number, VenueDetails> = {
  1: { surface: 'Clay', amenities: ['Changing Room', 'Free Parking'], badge: 'Top 10' },
  2: { surface: 'Open Air', amenities: ['Free Parking', 'Drinking Water'], badge: 'Top 10' },
  3: { surface: 'Streetball', amenities: ['Drinking Water'], badge: 'Top 10' },
  4: { surface: 'Turf', amenities: ['Flood Lights', 'Changing Room', 'Free Parking'], badge: 'Top 10' },
  5: { surface: 'Covered', amenities: ['Changing Room', 'Equipment Rental'], badge: 'Top 10' },
  6: { surface: 'Indoor', amenities: ['Changing Room', 'Showers', 'Free Parking'], badge: 'Top 10' },
}

export function detailsForVenue(venueId: number): VenueDetails {
  return venueDetails[venueId] ?? defaultDetails
}
