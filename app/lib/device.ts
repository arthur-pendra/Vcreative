/* Eén touch-detectie voor de hele site. Stond eerder op drie plekken
   met onderling afwijkende logica (één variant miste maxTouchPoints,
   waardoor bv. iPads in desktop-mode als niet-touch doorgingen). */

export const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0)
