import { formatMonthRange, formatWeekday, toIsoDate } from '../../utils/date'
import { Chip } from '../ui/Chip'

interface DayPickerProps {
  days: Date[]
  selected: string
  onSelect: (isoDate: string) => void
  labelledBy: string
}

export function DayPicker({ days, selected, onSelect, labelledBy }: DayPickerProps) {
  return (
    <div className="day-picker">
      <p className="day-picker__month">{formatMonthRange(days[0], days[days.length - 1])}</p>
      <div className="day-picker__days" role="group" aria-labelledby={labelledBy}>
        {days.map((day) => {
          const isoDate = toIsoDate(day)
          return (
            <Chip key={isoDate} selected={isoDate === selected} onClick={() => onSelect(isoDate)}>
              <span>{formatWeekday(day)}</span>
              <strong>{day.getDate()}</strong>
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
