import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/app/lib/site'

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/' },
  sitemap: `${SITE_URL}/sitemap.xml`,
})

export default robots
