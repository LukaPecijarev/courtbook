import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { findSportByThemeId } from '../api/sports'
import { addVenue, type CreatedVenueResponse } from '../api/venues'
import { Reveal } from '../components/Reveal'
import { SportBackdrop } from '../components/SportBackdrop'
import { TopBar } from '../components/TopBar'
import { ListingFields } from '../components/owner/ListingFields'
import { ManagementKeyNotice } from '../components/owner/ManagementKeyNotice'
import { SlotPicker } from '../components/owner/SlotPicker'
import {
  EMPTY_LISTING,
  hasErrors,
  toListing,
  validateListing,
  type ListingErrors,
  type ListingValues,
} from '../components/owner/listing'
import { slotCount, validateSlots } from '../components/owner/slots'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { findSportTheme, type SportTheme } from '../config/sportThemes'
import { addYourCourt } from '../content/ownerPage'
import { forgetSportVenues } from '../hooks/useSportVenues'
import { accentStyle } from '../utils/color'
import { nextDays } from '../utils/date'
import { storeManagementKey } from '../utils/managementKeys'
import { manageVenuePath, venuePath } from '../utils/paths'
import { playPress } from '../utils/ui'
import '../styles/venue.css'
import '../styles/owner.css'

const DAYS_AHEAD = 14

type SubmitState =
  | { status: 'editing' }
  | { status: 'submitting' }
  | { status: 'error'; message: string }
  | { status: 'created'; created: CreatedVenueResponse }

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : addYourCourt.error
}

export function AddVenuePage() {
  const { sportId = '' } = useParams()
  const sport = findSportTheme(sportId)

  return (
    <div className="theme venue-page owner-page" style={sport && accentStyle(sport.color)}>
      {sport && <SportBackdrop image={sport.backgroundImage} fixed />}
      <div className="venue-page__content">
        <TopBar sport={sport} />
        {sport ? (
          <AddVenueForm sport={sport} />
        ) : (
          <main className="venue-page-message">
            <p>{addYourCourt.unknownSport}</p>
          </main>
        )}
      </div>
    </div>
  )
}

function AddVenueForm({ sport }: { sport: SportTheme }) {
  const [days] = useState(() => nextDays(DAYS_AHEAD))
  const [listing, setListing] = useState<ListingValues>(EMPTY_LISTING)
  const [dates, setDates] = useState<string[]>([])
  const [startTimes, setStartTimes] = useState<string[]>([])
  const [errors, setErrors] = useState<ListingErrors & { dates?: string; startTimes?: string }>({})
  const [submit, setSubmit] = useState<SubmitState>({ status: 'editing' })

  if (submit.status === 'created') {
    const { venue, managementKey } = submit.created
    return (
      <main className="owner-page__notice">
        <ManagementKeyNotice
          managementKey={managementKey}
          venuePath={venuePath(venue, sport)}
          managePath={manageVenuePath(venue.id)}
        />
      </main>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    if (submitter) playPress(submitter)
    const nextErrors = { ...validateListing(listing), ...validateSlots(dates, startTimes) }
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSubmit({ status: 'submitting' })
    try {
      const backendSport = await findSportByThemeId(sport.id)
      if (!backendSport) throw new Error(addYourCourt.unknownSport)
      const created = await addVenue(toListing(listing), backendSport.id, { dates, startTimes })
      storeManagementKey(created.venue.id, created.managementKey)
      forgetSportVenues()
      setSubmit({ status: 'created', created })
    } catch (error) {
      setSubmit({ status: 'error', message: errorMessage(error) })
    }
  }

  const count = slotCount(dates, startTimes)
  return (
    <main>
      <form className="venue-page__main owner-page__main" onSubmit={handleSubmit} noValidate>
        <div className="venue-page__column">
          <Reveal>
            <header className="venue-page__heading" data-cursor-accent data-rise>
              <p className="venue-page__tagline">
                {sport.label} · {addYourCourt.tagline}
              </p>
              <h1 className="venue-page__name">{addYourCourt.title}</h1>
              <p className="venue-page__location">{addYourCourt.intro}</p>
            </header>
          </Reveal>

          <Reveal>
            <section className="venue-page__section" aria-labelledby="listing-title" data-cursor-accent>
              <SectionTitle id="listing-title" size="sm">
                {addYourCourt.listingTitle}
              </SectionTitle>
              <ListingFields values={listing} errors={errors} onChange={setListing} />
            </section>
          </Reveal>

          <Reveal>
            <SlotPicker
              idPrefix="add"
              days={days}
              dates={dates}
              startTimes={startTimes}
              onDatesChange={setDates}
              onStartTimesChange={setStartTimes}
              datesError={errors.dates}
              startTimesError={errors.startTimes}
              datesTitle={addYourCourt.datesTitle}
              hoursTitle={addYourCourt.hoursTitle}
            />
          </Reveal>
        </div>

        <Card as="aside" className="booking-bar" aria-label={addYourCourt.summaryLabel} data-cursor-accent data-rise>
          <div className="booking-bar__summary">
            <p className="booking-bar__when" aria-live="polite">
              {count > 0 ? <strong>{addYourCourt.slotCount(count)}</strong> : <span>{addYourCourt.pickSlots}</span>}
            </p>
            {submit.status === 'error' && (
              <p className="field__error" role="alert">
                {submit.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            label={submit.status === 'submitting' ? addYourCourt.submitting : addYourCourt.submit}
            withArrow
            disabled={submit.status === 'submitting'}
          />
        </Card>
      </form>
    </main>
  )
}
