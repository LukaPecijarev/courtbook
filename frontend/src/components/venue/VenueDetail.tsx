import { useState } from 'react'
import type { VenueResponse } from '../../api/venues'
import type { SportTheme } from '../../config/sportThemes'
import { venuePage } from '../../content/venuePage'
import { useAvailability } from '../../hooks/useAvailability'
import { accentStyle } from '../../utils/color'
import { nextDays, toIsoDate } from '../../utils/date'
import { venueLocation } from '../../utils/ui'
import { venueTransitionName } from '../../utils/venueTransition'
import { Reveal } from '../Reveal'
import { SportBackdrop } from '../SportBackdrop'
import { TopBar } from '../TopBar'
import { SectionTitle } from '../ui/SectionTitle'
import { Tag } from '../ui/Tag'
import { BookingBar } from './BookingBar'
import { BookingDialog } from './BookingDialog'
import { DayPicker } from './DayPicker'
import { SlotGrid } from './SlotGrid'

const DAYS_AHEAD = 7

interface VenueDetailProps {
  venue: VenueResponse
  sport: SportTheme
  sportId: number
  image: string
}

export function VenueDetail({ venue, sport, sportId, image }: VenueDetailProps) {
  const [days] = useState(() => nextDays(DAYS_AHEAD))
  const [date, setDate] = useState(() => toIsoDate(days[0]))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [bookingSlot, setBookingSlot] = useState<string | null>(null)
  const [slotsVersion, setSlotsVersion] = useState(0)
  const slots = useAvailability(venue.id, date, sportId, slotsVersion)

  const selectDate = (isoDate: string) => {
    setDate(isoDate)
    setSelectedSlot(null)
  }

  const reloadSlots = () => {
    setSlotsVersion((version) => version + 1)
    setSelectedSlot(null)
  }

  return (
    <div className="theme venue-page" style={accentStyle(sport.color)}>
      <SportBackdrop image={sport.backgroundImage} fixed />
      <div className="venue-page__content" inert={bookingSlot !== null}>
        <div className="venue-hero" data-cursor-accent>
          <TopBar sport={sport} overlay />
          <img src={image} alt="" style={{ viewTransitionName: venueTransitionName(venue.id) }} />
        </div>

        <main className="venue-page__main">
          <div className="venue-page__column">
            <Reveal>
              <header className="venue-page__heading" data-cursor-accent data-rise>
                <p className="venue-page__tagline">
                  {sport.label} {venue.surface ?? venuePage.defaultSurface}
                </p>
                <div className="venue-page__title-row">
                  <h1 className="venue-page__name">{venue.name}</h1>
                  {venue.badge && <Tag tone="outline">{venue.badge}</Tag>}
                </div>
                <p className="venue-page__location">
                  {venueLocation(venue)}
                </p>
                {venue.amenities.length > 0 && (
                  <ul className="venue-page__amenities" aria-label={venuePage.amenities}>
                    {venue.amenities.map((amenity) => (
                      <li key={amenity}>
                        <Tag>{amenity}</Tag>
                      </li>
                    ))}
                  </ul>
                )}
              </header>
            </Reveal>

            <Reveal>
              <section className="venue-page__section" aria-labelledby="venue-date-title" data-cursor-accent>
                <SectionTitle id="venue-date-title" size="sm">
                  {venuePage.dateTitle}
                </SectionTitle>
                <DayPicker days={days} selected={date} onSelect={selectDate} labelledBy="venue-date-title" />
              </section>
            </Reveal>

            <Reveal>
              <section className="venue-page__section" aria-labelledby="venue-slot-title" data-cursor-accent>
                <SectionTitle id="venue-slot-title" size="sm">
                  {venuePage.slotTitle}
                </SectionTitle>
                <SlotGrid
                  state={slots}
                  selected={selectedSlot}
                  onSelect={setSelectedSlot}
                  labelledBy="venue-slot-title"
                />
              </section>
            </Reveal>
          </div>

          <BookingBar
            pricePerHour={venue.pricePerHour}
            selectedSlot={selectedSlot}
            onBook={() => setBookingSlot(selectedSlot)}
          />
        </main>
      </div>

      {bookingSlot && (
        <BookingDialog
          venue={venue}
          sportId={sportId}
          startAt={bookingSlot}
          onClose={() => setBookingSlot(null)}
          onAvailabilityChanged={reloadSlots}
        />
      )}
    </div>
  )
}
