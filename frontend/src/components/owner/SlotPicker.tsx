import type { MouseEvent, ReactNode } from 'react'
import { playPress } from '../../utils/ui'
import { SectionTitle } from '../ui/SectionTitle'
import { Chip } from '../ui/Chip'
import { DayPicker } from '../venue/DayPicker'
import { SLOT_PERIODS } from '../venue/slotPeriods'

const FIRST_HOUR = 8
const LAST_HOUR = 22
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, index) => FIRST_HOUR + index)

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value].sort()
}

function pressChip(event: MouseEvent) {
  const chip = (event.target as Element).closest('.chip')
  if (chip) playPress(chip)
}

interface SlotPickerProps {
  idPrefix: string
  days: Date[]
  dates: string[]
  startTimes: string[]
  onDatesChange: (dates: string[]) => void
  onStartTimesChange: (startTimes: string[]) => void
  datesError?: string
  startTimesError?: string
  datesTitle: ReactNode
  hoursTitle: ReactNode
}

export function SlotPicker(props: SlotPickerProps) {
  const { idPrefix, days, dates, startTimes, onDatesChange, onStartTimesChange } = props
  const datesTitleId = `${idPrefix}-dates-title`
  const hoursTitleId = `${idPrefix}-hours-title`

  return (
    <div className="owner-slot-picker" onClickCapture={pressChip}>
      <section className="venue-page__section" aria-labelledby={datesTitleId}>
        <SectionTitle id={datesTitleId} size="sm">
          {props.datesTitle}
        </SectionTitle>
        <DayPicker
          days={days}
          selected={dates}
          onSelect={(isoDate) => onDatesChange(toggle(dates, isoDate))}
          labelledBy={datesTitleId}
        />
        {props.datesError && <p className="field__error">{props.datesError}</p>}
      </section>

      <section className="venue-page__section" aria-labelledby={hoursTitleId}>
        <SectionTitle id={hoursTitleId} size="sm">
          {props.hoursTitle}
        </SectionTitle>
        <div className="slot-grid" role="group" aria-labelledby={hoursTitleId}>
          {SLOT_PERIODS.map((period, index) => {
            const fromHour = index === 0 ? 0 : SLOT_PERIODS[index - 1].untilHour
            const hours = HOURS.filter((hour) => hour >= fromHour && hour < period.untilHour)
            return (
              <div key={period.id} className="slot-grid__period">
                <p className="slot-grid__label">{period.label}</p>
                <div className="slot-grid__slots">
                  {hours.map((hour) => (
                    <Chip
                      key={hour}
                      selected={startTimes.includes(hourLabel(hour))}
                      onClick={() => onStartTimesChange(toggle(startTimes, hourLabel(hour)))}
                    >
                      {hourLabel(hour)}
                    </Chip>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {props.startTimesError && <p className="field__error">{props.startTimesError}</p>}
      </section>
    </div>
  )
}
