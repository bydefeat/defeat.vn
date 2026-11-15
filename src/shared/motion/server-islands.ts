/**
 * Server islands under <ClientRouter /> + CSP.
 *
 * Astro loads each `server:defer` island with a small inline script. On a
 * client-side navigation the router re-creates the new page's inline scripts,
 * but the browser still enforces the CSP of the *first* page loaded, which
 * doesn't carry those per-page hashes, so the island would never load.
 * Instead we disarm those inline scripts in the incoming document and fetch
 * the islands from this bundled (CSP-trusted) module after the swap.
 */
const MARKER = '[if astro]>server-island-start<![endif]';
const pending: Array<{ id: string; url: string }> = [];

function islandUrl(code: string): string | null {
  const m = code.match(/fetch\(("(?:[^"\\]|\\.)*")/);
  if (!m?.[1]) return null;
  try {
    return JSON.parse(m[1]) as string;
  } catch {
    return null;
  }
}

async function load({ id, url }: { id: string; url: string }) {
  const anchor = document.querySelector(`script[data-island-id="${CSS.escape(id)}"]`);
  if (!anchor) return;
  const res = await fetch(url).catch(() => null);
  if (!res || res.status !== 200 || res.headers.get('content-type')?.split(';')[0]?.trim() !== 'text/html') return;
  const html = await res.text().catch(() => null);
  if (html === null || !anchor.isConnected) return;
  // Same replacement as Astro's runtime: drop the fallback up to the start marker, insert the island.
  let prev = anchor.previousSibling;
  while (prev && !(prev.nodeType === Node.COMMENT_NODE && (prev as Comment).data === MARKER)) {
    prev.remove();
    prev = anchor.previousSibling;
  }
  prev?.remove();
  anchor.before(document.createRange().createContextualFragment(html));
  anchor.remove();
}

export function initServerIslands() {
  document.addEventListener('astro:before-swap', (e) => {
    pending.length = 0;
    for (const s of e.newDocument.querySelectorAll<HTMLScriptElement>('script:not([src])')) {
      const code = s.textContent ?? '';
      const id = s.dataset.islandId;
      if (id) {
        const url = islandUrl(code);
        if (!url) continue; // unknown loader shape: leave it to Astro
        pending.push({ id, url });
      } else if (!code.includes('function replaceServerIsland')) continue;
      s.removeAttribute('data-astro-rerun');
      s.dataset.astroExec = ''; // tells the router not to execute it
    }
  });
  document.addEventListener('astro:after-swap', () => {
    for (const p of pending.splice(0)) void load(p);
  });
}
