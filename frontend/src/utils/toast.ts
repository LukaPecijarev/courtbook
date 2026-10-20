interface Toast {
  id: number
  message: string
}

const TOAST_DURATION_MS = 3200

let current: Toast | null = null
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function showToast(message: string) {
  const toast = { id: nextId++, message }
  current = toast
  emit()
  setTimeout(() => {
    if (current?.id !== toast.id) return
    current = null
    emit()
  }, TOAST_DURATION_MS)
}

export function subscribeToToasts(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function currentToast(): Toast | null {
  return current
}
