import type { ReactNode } from 'react'

interface TagProps {
  tone?: 'plain' | 'outline' | 'solid'
  children: ReactNode
}

export function Tag({ tone = 'plain', children }: TagProps) {
  return (
    <span className="tag" data-tone={tone}>
      {children}
    </span>
  )
}
