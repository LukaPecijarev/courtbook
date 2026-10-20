import { venuePage } from '../../content/venuePage'
import type { AsyncState } from '../../hooks/useAsync'
import type { AvailabilitySlot } from '../../hooks/useAvailability'
import { formatTime } from '../../utils/date'
import { Chip } from '../ui/Chip'
import './SlotGrid.css'

const SKELETON_COUNT = 12

const PERIODS = [
  { id: 'morning', label: venuePage.morning, untilHour: 12 },
  { id: 'afternoon', label: venuePage.afternoon, untilHour: 18 },
  { id: 'evening', label: venuePage.evening, untilHour: 24 },
]

function startHour(slot: AvailabilitySlot): number {
  return Number(slot.startAt.slice(11, 13))
}

function groupByPeriod(slots: AvailabilitySlot[]) {
  return PERIODS.map((period, index) => {
    const fromHour = index === 0 ? 0 : PERIODS[index - 1].untilHour
    const periodSlots = slots.filter((slot) => startHour(slot) >= fromHour && startHour(slot) < period.untilHour)
    return { ...period, slots: periodSlots }
  }).filter((period) => period.slots.length > 0)
}

function slotLabel(slot: AvailabilitySlot): string {
  const time = formatTime(slot.startAt)
  if (!slot.available) return `${time}, ${venuePage.slotTaken}`
  if (slot.past) return `${time}, ${venuePage.slotPast}`
  return time
}

interface SlotGridProps {
  state: AsyncState<AvailabilitySlot[]>
  selected: string | null
  onSelect: (startAt: string) => void
  labelledBy: string
}

export function SlotGrid({ state, selected, onSelect, labelledBy }: SlotGridProps) {
  if (state.status === 'loading') {
    return (
      <div className="slot-grid__slots" aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div key={index} className="skeleton" />
        ))}
      </div>
    )
  }
  if (state.status === 'error') {
    return (
      <p className="slot-grid__message slot-grid__message--error" role="alert">
        {venuePage.slotsError}
      </p>
    )
  }
  if (state.data.length === 0) {
    return <p className="slot-grid__message">{venuePage.slotsEmpty}</p>
  }
  return (
    <div className="slot-grid" role="group" aria-labelledby={labelledBy}>
      {groupByPeriod(state.data).map((period) => (
        <div key={period.id} className="slot-grid__period" role="group" aria-labelledby={`slot-period-${period.id}`}>
          <p id={`slot-period-${period.id}`} className="slot-grid__label">
            {period.label}
          </p>
          <div className="slot-grid__slots">
            {period.slots.map((slot) => (
              <SlotChip key={slot.startAt} slot={slot} selected={slot.startAt === selected} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface SlotChipProps {
  slot: AvailabilitySlot
  selected: boolean
  onSelect: (startAt: string) => void
}

function SlotChip({ slot, selected, onSelect }: SlotChipProps) {
  const time = formatTime(slot.startAt)
  return (
    <Chip
      selected={selected}
      disabled={!slot.available || slot.past}
      aria-label={slotLabel(slot)}
      onClick={() => onSelect(slot.startAt)}
    >
      {slot.available ? time : <s>{time}</s>}
    </Chip>
  )
}
