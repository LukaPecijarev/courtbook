import type { HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'aside' | 'nav'
}

export function Card({ as: Element = 'div', className, ...rest }: CardProps) {
  return <Element className={classNames('card', className)} {...rest} />
}
