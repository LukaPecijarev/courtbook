import { bookingBar } from '../../content/venuePage'
import { formatLongDate, formatTime } from '../../utils/date'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Price } from '../ui/Price'

interface BookingBarProps {
  pricePerHour: number
  selectedSlot: string | null
  onBook: () => void
}

export function BookingBar({ pricePerHour, selectedSlot, onBook }: BookingBarProps) {
  return (
    <Card as="aside" className="booking-bar" aria-label={bookingBar.label} data-cursor-accent data-rise>
      <div className="booking-bar__summary">
        <Price amount={pricePerHour} unit={bookingBar.perHour} />
        <p className="booking-bar__when" aria-live="polite">
          {selectedSlot ? (
            <>
              <span>{formatLongDate(selectedSlot)}</span>
              <strong>{formatTime(selectedSlot)}</strong>
            </>
          ) : (
            <span>{bookingBar.pickSlot}</span>
          )}
        </p>
      </div>
      <Button label={bookingBar.bookNow} withArrow disabled={!selectedSlot} onClick={onBook} />
    </Card>
  )
}
