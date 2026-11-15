// Per-page lifecycle for client-side navigation (Astro <ClientRouter />).
// Bundled scripts run once per session, so everything a page sets up
// (listeners, observers, timers, workers) must be torn down before the next swap.
let ctrl = new AbortController();
let cleanups: Array<() => void> = [];

/** Abort signal for the current page; pass it to addEventListener. */
export const pageSignal = (): AbortSignal => ctrl.signal;

/** Register a cleanup to run when the current page is swapped out. */
export function onCleanup(fn: () => void) {
  cleanups.push(fn);
}

export function teardownPage() {
  ctrl.abort();
  ctrl = new AbortController();
  const fns = cleanups;
  cleanups = [];
  for (const fn of fns) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
}

