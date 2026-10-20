import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import { classNames } from '../utils/ui'

interface RevealProps {
  id?: string
  className?: string
  children: ReactNode
}

export function Reveal({ id, className, children }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} id={id} className={classNames('reveal', className)} data-state={inView ? 'visible' : undefined}>
      {children}
    </div>
  )
}
