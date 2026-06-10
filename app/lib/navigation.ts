/* Hoofdnavigatie — één bron voor het header-menu en de footer-kolom,
   zodat een nieuwe route niet op twee plekken bijgehouden hoeft te
   worden. */

export const NAV_ITEMS = [
  { label: 'Projecten', href: '/cases' },
  { label: 'Over', href: '/over-mij' },
  { label: 'Start project', href: '/contact' },
] as const
