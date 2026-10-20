import { useSyncExternalStore } from 'react'
import { currentToast, subscribeToToasts } from '../utils/toast'

export function Toaster() {
  const toast = useSyncExternalStore(subscribeToToasts, currentToast)
  return (
    <div className="theme toaster" role="status" aria-live="polite">
      {toast && (
        <p key={toast.id} className="toast">
          {toast.message}
        </p>
      )}
    </div>
  )
}
