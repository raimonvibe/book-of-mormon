/** URL slug helpers for book/chapter routes (e.g. /moroni/10). */

export function bookNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export function bookPath(book: { name: string }): string {
  return `/${bookNameToSlug(book.name)}`
}

export function chapterPath(
  book: { name: string },
  chapter: { number: string }
): string {
  return `${bookPath(book)}/${chapter.number}`
}

export function findBookBySlug<T extends { name: string }>(
  books: T[],
  slug: string
): T | undefined {
  const normalized = slug.toLowerCase()
  return books.find((b) => bookNameToSlug(b.name) === normalized)
}

export function parseSlugSegments(
  slug: string | string[] | undefined
): string[] {
  if (!slug) return []
  return Array.isArray(slug) ? slug : [slug]
}
