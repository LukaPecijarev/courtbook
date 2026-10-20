import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading'; previous?: T }
  | { status: 'error'; error: unknown }
  | { status: 'loaded'; data: T }

export function useAsync<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
  cached?: T,
): AsyncState<T> {
  const [result, setResult] = useState<{ key: string; state: AsyncState<T> } | undefined>(() =>
    cached === undefined ? undefined : { key, state: { status: 'loaded', data: cached } },
  )
  const latestLoad = useRef(load)

  useLayoutEffect(() => {
    latestLoad.current = load
  })

  useEffect(() => {
    const controller = new AbortController()
    const settle = (state: AsyncState<T>) => {
      if (!controller.signal.aborted) setResult({ key, state })
    }
    latestLoad.current(controller.signal)
      .then((data) => settle({ status: 'loaded', data }))
      .catch((error: unknown) => settle({ status: 'error', error }))
    return () => controller.abort()
  }, [key])

  if (result?.key === key) return result.state
  return result?.state.status === 'loaded' ? { status: 'loading', previous: result.state.data } : { status: 'loading' }
}
