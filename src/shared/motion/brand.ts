export function initBrandColors() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-brand]')) el.style.setProperty('--brand', el.dataset.brand!);
}
