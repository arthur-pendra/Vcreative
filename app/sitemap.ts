import type { MetadataRoute } from 'next'
import { CASES } from '@/app/cases/caseData'
import { SITE_URL } from '@/app/lib/site'

const sitemap = (): MetadataRoute.Sitemap => {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, priority: 1 },
    { url: `${SITE_URL}/cases`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/over-mij`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified, priority: 0.8 },
  ]

  const caseRoutes: MetadataRoute.Sitemap = Object.keys(CASES).map((slug) => ({
    url: `${SITE_URL}/cases/${slug}`,
    lastModified,
    priority: 0.6,
  }))

  return [...staticRoutes, ...caseRoutes]
}

export default sitemap
