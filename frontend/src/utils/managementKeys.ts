function storageKey(venueId: number): string {
  return `courtbook.managementKey.${venueId}`
}

export function readManagementKey(venueId: number): string | null {
  try {
    return localStorage.getItem(storageKey(venueId))
  } catch {
    return null
  }
}

export function storeManagementKey(venueId: number, managementKey: string) {
  try {
    localStorage.setItem(storageKey(venueId), managementKey)
  } catch {
    // Storage can be blocked; the creator then has to keep the key themselves.
  }
}

export function forgetManagementKey(venueId: number) {
  try {
    localStorage.removeItem(storageKey(venueId))
  } catch {
    // Nothing stored when storage is blocked.
  }
}
