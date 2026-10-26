import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  blockSlot,
  fetchManagedSlots,
  publishSlots,
  removeSlot,
  updateVenue,
  type ManagedSlotResponse,
  type VenueResponse,
} from '../api/venues'
import { Reveal } from '../components/Reveal'
import { SportBackdrop } from '../components/SportBackdrop'
import { TopBar } from '../components/TopBar'
import { DeleteVenueDialog } from '../components/owner/DeleteVenueDialog'
import { ListingFields } from '../components/owner/ListingFields'
import { SlotPicker } from '../components/owner/SlotPicker'
import {
  hasErrors,
  listingValuesOf,
  toListing,
  validateListing,
  type ListingErrors,
  type ListingValues,
} from '../components/owner/listing'
import { slotCount, validateSlots } from '../components/owner/slots'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field } from '../components/ui/Field'
import { SectionTitle } from '../components/ui/SectionTitle'
import { findSportTheme, sportThemes, type SportTheme } from '../config/sportThemes'
import { deleteCourt, manageVenue } from '../content/ownerPage'
import { venuePage } from '../content/venuePage'
import { useAsync, type AsyncState } from '../hooks/useAsync'
import { forgetSportVenues } from '../hooks/useSportVenues'
import { useVenue } from '../hooks/useVenue'
import { accentStyle } from '../utils/color'
import { formatLongDate, formatTime, nextDays } from '../utils/date'
import { forgetManagementKey, readManagementKey, storeManagementKey } from '../utils/managementKeys'
import { sportPath, venuePath } from '../utils/paths'
import { playPress, prefersReducedMotion } from '../utils/ui'
import { showToast } from '../utils/toast'
import '../styles/venue.css'
import '../styles/owner.css'

const DAYS_AHEAD = 14

type ActionState = { status: 'idle' | 'busy' } | { status: 'done'; message: string } | { status: 'error'; message: string }

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

function sportOf(venue: VenueResponse): SportTheme {
  return venue.sports.map((sport) => findSportTheme(sport.name)).find(Boolean) ?? sportThemes[0]
}

export function ManageVenuePage() {
  const { venueId = '' } = useParams()
  const id = Number(venueId)
  const venue = useVenue(id)
  const [managementKey, setManagementKey] = useState(() => readManagementKey(id))
  const [keyError, setKeyError] = useState<string>()

  const rejectKey = (message: string) => {
    forgetManagementKey(id)
    setManagementKey(null)
    setKeyError(message)
  }

  if (venue.status === 'loading') return <ManageMessage loading />
  if (venue.status === 'error') return <ManageMessage message={manageVenue.notFound} />

  const sport = sportOf(venue.data)
  return (
    <div className="theme venue-page owner-page" style={accentStyle(sport.color)}>
      <SportBackdrop image={sport.backgroundImage} fixed />
      <div className="venue-page__content">
        <TopBar sport={sport} />
        {managementKey ? (
          <ManageVenue
            key={managementKey}
            venue={venue.data}
            sport={sport}
            managementKey={managementKey}
            onKeyRejected={rejectKey}
          />
        ) : (
          <KeyForm
            venue={venue.data}
            error={keyError}
            onSubmit={(key) => {
              setKeyError(undefined)
              setManagementKey(key)
            }}
          />
        )}
      </div>
    </div>
  )
}

function ManageHeading({ venue, sport }: { venue: VenueResponse; sport: SportTheme }) {
  return (
    <Reveal>
      <header className="venue-page__heading" data-cursor-accent data-rise>
        <p className="venue-page__tagline">
          {sport.label} · {manageVenue.tagline}
        </p>
        <h1 className="venue-page__name">{venue.name}</h1>
      </header>
    </Reveal>
  )
}

interface KeyFormProps {
  venue: VenueResponse
  error?: string
  onSubmit: (managementKey: string) => void
}

function KeyForm({ venue, error, onSubmit }: KeyFormProps) {
  const [value, setValue] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    if (submitter) playPress(submitter)
    if (value.trim()) onSubmit(value.trim())
  }

  return (
    <main className="owner-page__notice">
      <Card className="owner-key" data-cursor-accent data-rise>
        <p className="venue-page__tagline">{venue.name}</p>
        <SectionTitle as="h1" size="md">
          {manageVenue.keyTitle}
        </SectionTitle>
        <form className="owner-key__form" onSubmit={submit} noValidate>
          <Field id="management-key" label={manageVenue.keyLabel} value={value} onChange={setValue}
            error={error} type="password" autoComplete="off" />
          <Button type="submit" label={manageVenue.keySubmit} withArrow />
        </form>
      </Card>
    </main>
  )
}

interface ManageVenueProps {
  venue: VenueResponse
  sport: SportTheme
  managementKey: string
  onKeyRejected: (message: string) => void
}

function ManageVenue({ venue, sport, managementKey, onKeyRejected }: ManageVenueProps) {
  const [days] = useState(() => nextDays(DAYS_AHEAD))
  const [current, setCurrent] = useState(venue)
  const [listing, setListing] = useState<ListingValues>(() => listingValuesOf(venue))
  const [listingErrors, setListingErrors] = useState<ListingErrors>({})
  const [saveState, setSaveState] = useState<ActionState>({ status: 'idle' })
  const [dates, setDates] = useState<string[]>([])
  const [startTimes, setStartTimes] = useState<string[]>([])
  const [slotErrors, setSlotErrors] = useState<{ dates?: string; startTimes?: string }>({})
  const [publishState, setPublishState] = useState<ActionState>({ status: 'idle' })
  const [slotsVersion, setSlotsVersion] = useState(0)
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const slots = useAsync(`managed-slots:${venue.id}:${slotsVersion}`, (signal) =>
    fetchManagedSlots(venue.id, managementKey, signal),
  )

  useEffect(() => {
    if (slots.status === 'loaded') storeManagementKey(venue.id, managementKey)
    if (slots.status === 'error' && isUnauthorized(slots.error)) onKeyRejected((slots.error as ApiError).message)
  }, [slots, venue.id, managementKey, onKeyRejected])

  const run = async (action: () => Promise<void>, setState: (state: ActionState) => void, fallback: string) => {
    setState({ status: 'busy' })
    try {
      await action()
    } catch (error) {
      if (isUnauthorized(error)) return onKeyRejected((error as ApiError).message)
      setState({ status: 'error', message: errorMessage(error, fallback) })
    }
  }

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = validateListing(listing)
    setListingErrors(errors)
    if (hasErrors(errors)) return
    run(async () => {
      const updated = await updateVenue(venue.id, managementKey, toListing(listing))
      forgetSportVenues()
      setCurrent(updated)
      setSaveState({ status: 'done', message: manageVenue.saved })
    }, setSaveState, venuePage.loadError)
  }

  const publish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = validateSlots(dates, startTimes)
    setSlotErrors(errors)
    if (hasErrors(errors)) return
    run(async () => {
      const published = await publishSlots(venue.id, managementKey, { dates, startTimes })
      setDates([])
      setStartTimes([])
      setSlotsVersion((version) => version + 1)
      setPublishState({ status: 'done', message: manageVenue.published(published.length) })
    }, setPublishState, venuePage.loadError)
  }

  const remove = (slot: ManagedSlotResponse) =>
    run(async () => {
      await removeSlot(venue.id, slot.id, managementKey)
      setSlotsVersion((version) => version + 1)
    }, setPublishState, venuePage.loadError)

  const block = (slot: ManagedSlotResponse) =>
    run(async () => {
      await blockSlot(venue.id, managementKey, slot.startAt)
      setSelectedSlotId(null)
      setSlotsVersion((version) => version + 1)
      setPublishState({ status: 'done', message: manageVenue.blocked })
    }, setPublishState, venuePage.loadError)

  const courtDeleted = () => {
    forgetManagementKey(venue.id)
    forgetSportVenues()
    navigate(sportPath(sport), { replace: true, viewTransition: !prefersReducedMotion() })
    showToast(deleteCourt.deleted)
  }

  const pressSubmitter = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    if (submitter) playPress(submitter)
  }

  return (
    <main className="venue-page__main owner-page__main">
      <div className="venue-page__column">
        <ManageHeading venue={current} sport={sport} />

        <Reveal>
          <form className="venue-page__section" aria-labelledby="manage-listing-title" noValidate
            onSubmit={(event) => { pressSubmitter(event); save(event) }} data-cursor-accent>
            <SectionTitle id="manage-listing-title" size="sm">
              {manageVenue.listingTitle}
            </SectionTitle>
            <ListingFields values={listing} errors={listingErrors} onChange={setListing} />
            <ActionMessage state={saveState} />
            <Button type="submit" label={saveState.status === 'busy' ? manageVenue.saving : manageVenue.save}
              disabled={saveState.status === 'busy'} />
          </form>
        </Reveal>

        <Reveal>
          <form className="owner-page__slots-form" noValidate onSubmit={(event) => { pressSubmitter(event); publish(event) }}>
            <SlotPicker
              idPrefix="manage"
              days={days}
              dates={dates}
              startTimes={startTimes}
              onDatesChange={setDates}
              onStartTimesChange={setStartTimes}
              datesError={slotErrors.dates}
              startTimesError={slotErrors.startTimes}
              datesTitle={manageVenue.addSlotsTitle}
              hoursTitle={venuePage.slotTitle}
            />
            <ActionMessage state={publishState} />
            <Button
              type="submit"
              label={publishState.status === 'busy' ? manageVenue.publishing : manageVenue.publish}
              withArrow
              disabled={publishState.status === 'busy' || slotCount(dates, startTimes) === 0}
            />
          </form>
        </Reveal>

        <Reveal>
          <section className="owner-danger" aria-label={deleteCourt.open}>
            <Button label={deleteCourt.open} tone="danger" onClick={() => setDeleting(true)} />
          </section>
        </Reveal>
      </div>

      <Card as="aside" className="owner-slots" aria-labelledby="manage-slots-title" data-cursor-accent data-rise>
        <SectionTitle id="manage-slots-title" size="sm">
          {manageVenue.slotsTitle}
        </SectionTitle>
        <SlotList
          state={slots}
          selectedId={selectedSlotId}
          onSelect={setSelectedSlotId}
          onBlock={block}
          onRemove={remove}
          busy={publishState.status === 'busy'}
        />
        <Button to={venuePath(current, sport)} label={manageVenue.viewVenue} withArrow quiet />
      </Card>

      {deleting && (
        <DeleteVenueDialog
          venueId={venue.id}
          venueName={current.name}
          managementKey={managementKey}
          onDeleted={courtDeleted}
          onClose={() => setDeleting(false)}
        />
      )}
    </main>
  )
}

function ActionMessage({ state }: { state: ActionState }) {
  if (state.status === 'error') return <p className="field__error" role="alert">{state.message}</p>
  if (state.status === 'done') return <p className="owner-page__done" role="status">{state.message}</p>
  return null
}

interface SlotListProps {
  state: AsyncState<ManagedSlotResponse[]>
  busy: boolean
  selectedId: number | null
  onSelect: (slotId: number) => void
  onBlock: (slot: ManagedSlotResponse) => void
  onRemove: (slot: ManagedSlotResponse) => void
}

function groupByDate(slots: ManagedSlotResponse[]): [string, ManagedSlotResponse[]][] {
  const groups = new Map<string, ManagedSlotResponse[]>()
  for (const slot of slots) {
    const date = slot.startAt.slice(0, 10)
    groups.set(date, [...(groups.get(date) ?? []), slot])
  }
  return [...groups]
}

function SlotList({ state, busy, selectedId, onSelect, onBlock, onRemove }: SlotListProps) {
  const slots = state.status === 'loaded' ? state.data : state.status === 'loading' ? state.previous : undefined
  if (state.status === 'error') return <p className="field__error" role="alert">{manageVenue.slotsError}</p>
  if (!slots) return <div className="skeleton skeleton--line" aria-busy="true" />
  if (slots.length === 0) return <p className="owner-slots__empty">{manageVenue.slotsEmpty}</p>

  return (
    <div className="owner-slots__days">
      {groupByDate(slots).map(([date, daySlots]) => (
        <div key={date} className="owner-slots__day">
          <p className="slot-grid__label">{formatLongDate(daySlots[0].startAt)}</p>
          <ul className="owner-slots__list">
            {daySlots.map((slot) => {
              const selected = slot.id === selectedId
              return (
                <li key={slot.id} className={`owner-slots__item${selected ? ' owner-slots__item--selected' : ''}`}>
                  <button
                    type="button"
                    className="owner-slots__time owner-slots__select"
                    disabled={slot.booked || busy}
                    aria-pressed={selected}
                    onClick={() => onSelect(slot.id)}
                  >
                    {formatTime(slot.startAt)}
                  </button>
                  {slot.booked && <span className="owner-slots__booked">{manageVenue.booked}</span>}
                  {selected && !slot.booked && (
                    <button
                      type="button"
                      className="owner-slots__remove owner-slots__block"
                      disabled={busy}
                      onClick={() => onBlock(slot)}
                      aria-label={`${manageVenue.block} ${formatLongDate(slot.startAt)} ${formatTime(slot.startAt)}`}
                    >
                      {manageVenue.block}
                    </button>
                  )}
                  <button
                    type="button"
                    className="owner-slots__remove"
                    disabled={slot.booked || busy}
                    onClick={() => onRemove(slot)}
                    aria-label={`${manageVenue.remove} ${formatLongDate(slot.startAt)} ${formatTime(slot.startAt)}`}
                  >
                    {manageVenue.remove}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ManageMessage({ loading = false, message }: { loading?: boolean; message?: string }) {
  return (
    <div className="theme venue-page">
      <TopBar />
      <main className="venue-page-message" aria-busy={loading || undefined}>
        {!loading && <p>{message}</p>}
      </main>
    </div>
  )
}
