/* Brand-kleuren voor TypeScript/GLSL-context. De CSS-kant leeft als
   custom properties in globals.css (--color-cream, --color-navy, …);
   deze constanten moeten daar 1-op-1 mee in sync blijven. */

export const COLOR_CREAM = '#faf8f2'

/* '#rrggbb' → [r, g, b] genormaliseerd naar 0..1, voor shader-uniforms. */
export const hexToRgb01 = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ]
}
