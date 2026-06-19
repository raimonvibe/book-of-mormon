export function verseHash(verse: string): string {
  return `#v${verse}`
}

export function parseVerseHash(hash: string): string | null {
  const match = hash.match(/^#v(\d+)$/)
  return match?.[1] ?? null
}
