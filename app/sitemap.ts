import type { MetadataRoute } from 'next'
import { getSitemapEntries } from '@/lib/sitemap-data'

/** Full URL list (homepage + 15 books + 111 chapters). Not linked from robots.txt. */
export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapEntries()
}
