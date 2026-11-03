/** Gán màu thương hiệu cho logo công nghệ ([data-brand="#hex"] → biến --brand). Qua CSSOM nên tương thích CSP. */
export function initBrandColors() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-brand]')) el.style.setProperty('--brand', el.dataset.brand!);
}
