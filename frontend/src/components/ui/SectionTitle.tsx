import type { ReactNode } from 'react'

interface SectionTitleProps {
  id?: string
  as?: 'h1' | 'h2'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

export function SectionTitle({ id, as: Heading = 'h2', size = 'lg', children }: SectionTitleProps) {
  return (
    <Heading id={id} className="section-title" data-size={size}>
      {children}
    </Heading>
  )
}
