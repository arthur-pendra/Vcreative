import type { SyntheticEvent } from 'react'

/* Verbergt een <img> waarvan de bron 404't (bv. een klantlogo dat nog
   niet is aangeleverd) zodat er geen broken-image icoon verschijnt.
   Gedeeld door de reviews-carousel en het quote-blok op case-pagina's. */
export const hideImageOnError = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.visibility = 'hidden'
}
