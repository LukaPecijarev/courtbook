const requested = new Set<string>()

export function preloadImages(urls: string[]) {
  for (const url of urls) {
    if (requested.has(url)) continue
    requested.add(url)
    const image = new Image()
    image.src = url
    image.decode().catch(() => undefined)
  }
}

export function decodeImage(url: string, maxWaitMs: number): Promise<void> {
  const image = new Image()
  image.src = url
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs))
  return Promise.race([image.decode().catch(() => undefined), timeout])
}
