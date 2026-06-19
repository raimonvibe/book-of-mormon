import fs from 'fs'
import path from 'path'
import type { MetadataRoute } from 'next'
import { bookPath, chapterPath } from '@/lib/routes'
import { getSiteUrl } from '@/lib/site'

interface BomJson {
  books: { name: string; chapters: { number: string }[] }[]
}

/** All public reader URLs for sitemap.xml (owner reference; site is not indexed). */
export function getSitemapEntries(): MetadataRoute.Sitemap {
  const filePath = path.join(process.cwd(), 'data', 'book-of-mormon-data.json')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as BomJson
  const base = getSiteUrl()
  const lastModified = new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]

  for (const book of data.books) {
    entries.push({
      url: `${base}${bookPath(book)}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.6,
    })
    for (const chapter of book.chapters) {
      entries.push({
        url: `${base}${chapterPath(book, chapter)}`,
        lastModified,
        changeFrequency: 'yearly',
        priority: 0.5,
      })
    }
  }

  return entries
}
