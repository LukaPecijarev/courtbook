import { useEffect, useState, type CSSProperties } from 'react'
import './SportBackdrop.css'

function useCrossfadeLayers(image: string) {
  const [layers, setLayers] = useState<string[]>([image])

  useEffect(() => {
    let cancelled = false
    const next = new Image()
    next.src = image
    next
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return
        setLayers((current) => (current.at(-1) === image ? current : [...current.slice(-1), image]))
      })
    return () => {
      cancelled = true
    }
  }, [image])

  const dropHiddenLayers = () => setLayers((current) => current.slice(-1))
  return { layers, dropHiddenLayers }
}

interface SportBackdropProps {
  image: string
  fixed?: boolean
}

export function SportBackdrop({ image, fixed = false }: SportBackdropProps) {
  const { layers, dropHiddenLayers } = useCrossfadeLayers(image)

  return (
    <div className={`sport-backdrop${fixed ? ' sport-backdrop--fixed' : ''}`} aria-hidden="true">
      {layers.map((layer, index) => {
        const entering = layers.length > 1 && index === layers.length - 1
        return (
          <div
            key={layer}
            className="sport-backdrop__layer"
            data-state={entering ? 'entering' : undefined}
            style={{ '--section-bg': `url(${layer})` } as CSSProperties}
            onAnimationEnd={entering ? dropHiddenLayers : undefined}
          />
        )
      })}
    </div>
  )
}
