type SessionExpiredListener = () => void

type RuntimeState = typeof globalThis & {
  __censusSessionExpiredListeners?: Set<SessionExpiredListener>
}

const runtime = globalThis as RuntimeState
const listeners =
  runtime.__censusSessionExpiredListeners ??
  new Set<SessionExpiredListener>()

runtime.__censusSessionExpiredListeners = listeners

export function subscribeSessionExpired(
  listener: SessionExpiredListener,
): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifySessionExpired(): void {
  for (const listener of listeners) {
    listener()
  }
}
