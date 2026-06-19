import type { MetadataRoute } from 'next'

/**
 * Private site — block all crawlers. Do not list a Sitemap here so search
 * engines are not pointed at /sitemap.xml. The sitemap still exists for your
 * own use (bookmarks, audits) if you know the URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
