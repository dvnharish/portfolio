/**
 * Page scroll lock, keyed by owner.
 *
 * Two things need this — the preloader and the domain dialog — and they can
 * overlap. Two lesser designs both fail here:
 *
 *  - Per-component capture/restore: the second locker captures the first
 *    locker's "hidden" as the value to restore, so releasing it restores
 *    "hidden" and the page stays locked forever.
 *  - A plain reference count: one unbalanced lock (an effect that fires twice, a
 *    cleanup that never runs) desyncs the count permanently and pins the page.
 *
 * Keying by owner is idempotent in both directions: locking twice from the same
 * owner is a no-op, and the lock releases as soon as no owner holds it.
 *
 * It also locks the DOCUMENT ELEMENT, not `body`. `html` is the scrolling
 * element by default, so `body { overflow: hidden }` is silently a no-op — the
 * background keeps scrolling behind the modal while looking handled.
 */
/**
 * Identity token for a lock holder. Any stable string; only equality matters.
 * Each holder must pass the same value to lock and unlock.
 */
export type ScrollLockOwner = string

const owners = new Set<ScrollLockOwner>()
let restoreTo = ''

export function lockScroll(owner: ScrollLockOwner): void {
  if (typeof document === 'undefined') return
  if (owners.size === 0) {
    restoreTo = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }
  owners.add(owner)
}

export function unlockScroll(owner: ScrollLockOwner): void {
  if (typeof document === 'undefined') return
  owners.delete(owner)
  if (owners.size === 0) document.documentElement.style.overflow = restoreTo
}

/** Current holders. Exposed for debugging a stuck lock. */
export function scrollLockOwners(): readonly string[] {
  return [...owners]
}
