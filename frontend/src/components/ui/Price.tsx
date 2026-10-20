import { pricing } from '../../content/sportPage'
import { formatPrice, formatPricePerHour } from '../../utils/format'
import { Tag } from './Tag'

interface PriceProps {
  amount: number
  variant?: 'tag' | 'large'
  unit?: string
}

export function Price({ amount, variant = 'large', unit = pricing.perHour }: PriceProps) {
  if (variant === 'tag') return <Tag tone="solid">{formatPricePerHour(amount)}</Tag>
  return (
    <p className="price">
      <strong>{formatPrice(amount)}</strong>
      <span>{unit}</span>
    </p>
  )
}
