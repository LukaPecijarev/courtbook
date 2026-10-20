import type { CSSProperties } from 'react'

const DARK_TEXT = '#0f1115'
const LIGHT_TEXT = '#ffffff'

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function readableTextColor(background: string): string {
  const luminance = relativeLuminance(background)
  return contrastRatio(luminance, relativeLuminance(DARK_TEXT)) >=
    contrastRatio(luminance, relativeLuminance(LIGHT_TEXT))
    ? DARK_TEXT
    : LIGHT_TEXT
}

export function accentStyle(accent: string): CSSProperties {
  return { '--accent': accent, '--on-accent': readableTextColor(accent) } as CSSProperties
}
