export interface SearchEntry {
  bookId: string
  bookName: string
  chapterId: string
  chapterNumber: string
  reference: string
  verse: string
  text: string
}

export interface BookMeta {
  id: string
  name: string
  abbreviation: string
}

export interface SearchResult extends SearchEntry {
  fullReference: string
  snippet: string
  score: number
}

export interface ParsedQuery {
  type: 'reference' | 'text'
  reference?: { bookId: string; chapter: string; verse?: string }
  terms: string[]
  phrase?: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  parsedAs: 'reference' | 'text'
}

const REFERENCE_RE =
  /^((?:\d\s*)?[a-z][a-z.\s]*?(?:\s+of\s+[a-z]+)?)\s+(\d+)\s*(?::\s*(\d+))?\s*$/i

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[.\s]+/g, ' ').trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildBookLookup(books: BookMeta[]): Map<string, string> {
  const lookup = new Map<string, string>()
  for (const book of books) {
    lookup.set(normalizeKey(book.name), book.id)
    lookup.set(normalizeKey(book.abbreviation), book.id)
    lookup.set(normalizeKey(book.id), book.id)
    lookup.set(normalizeKey(book.name.replace(/\s+/g, '')), book.id)
  }
  lookup.set('w of m', 'WOM')
  lookup.set('words of mormon', 'WOM')
  lookup.set('word of mormon', 'WOM')
  return lookup
}

export function parseSearchQuery(raw: string, bookLookup: Map<string, string>): ParsedQuery {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { type: 'text', terms: [] }
  }

  const refMatch = trimmed.match(REFERENCE_RE)
  if (refMatch) {
    const bookKey = normalizeKey(refMatch[1])
    const bookId = bookLookup.get(bookKey)
    if (bookId) {
      return {
        type: 'reference',
        reference: {
          bookId,
          chapter: refMatch[2],
          verse: refMatch[3],
        },
        terms: [],
      }
    }
  }

  const phraseMatch = trimmed.match(/"([^"]+)"/)
  const phrase = phraseMatch?.[1]?.trim()
  const withoutPhrase = phrase ? trimmed.replace(/"([^"]+)"/, ' ').trim() : trimmed
  const terms = withoutPhrase
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0)

  return {
    type: 'text',
    terms,
    phrase: phrase?.toLowerCase(),
  }
}

export function highlightMatches(
  text: string,
  terms: string[],
  phrase?: string
): string {
  const patterns: string[] = []
  if (phrase) patterns.push(escapeRegExp(phrase))
  for (const term of terms) {
    if (term.length >= 2) patterns.push(escapeRegExp(term))
  }
  if (patterns.length === 0) return text

  const re = new RegExp(`(${patterns.join('|')})`, 'gi')
  return text.replace(re, '<mark class="search-hit">$1</mark>')
}

export function buildSnippet(
  text: string,
  terms: string[],
  phrase?: string,
  maxLength = 180
): string {
  const haystack = text.toLowerCase()
  let index = -1
  let matchLength = 0

  if (phrase && haystack.includes(phrase)) {
    index = haystack.indexOf(phrase)
    matchLength = phrase.length
  } else {
    for (const term of terms) {
      const termIndex = haystack.indexOf(term)
      if (termIndex !== -1 && (index === -1 || termIndex < index)) {
        index = termIndex
        matchLength = term.length
      }
    }
  }

  if (index === -1) {
    const snippet = text.slice(0, maxLength)
    return text.length > maxLength ? `${snippet}…` : snippet
  }

  const padding = Math.floor((maxLength - matchLength) / 2)
  const start = Math.max(0, index - padding)
  const end = Math.min(text.length, start + maxLength)
  const snippet = text.slice(start, end)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return `${prefix}${snippet}${suffix}`
}

function scoreEntry(
  entry: SearchEntry,
  terms: string[],
  phrase?: string
): number {
  const haystack = entry.text.toLowerCase()
  let score = 0

  if (phrase) {
    if (!haystack.includes(phrase)) return -1
    score += 120
    if (haystack.startsWith(phrase)) score += 20
  }

  for (const term of terms) {
    if (!haystack.includes(term)) return -1
    const occurrences = haystack.split(term).length - 1
    score += 10 * occurrences
    if (haystack.startsWith(term)) score += 8
  }

  if (terms.length > 1) {
    const joined = terms.join(' ')
    if (haystack.includes(joined)) score += 25
  }

  const density = (terms.length + (phrase ? 2 : 0)) / Math.max(entry.text.length / 80, 1)
  score += Math.min(density * 15, 15)

  return score
}

function toResult(
  entry: SearchEntry,
  terms: string[],
  phrase: string | undefined,
  score: number
): SearchResult {
  const snippet = buildSnippet(entry.text, terms, phrase)
  return {
    ...entry,
    fullReference: `${entry.reference}:${entry.verse}`,
    snippet,
    score,
  }
}

export function searchEntries(
  index: SearchEntry[],
  parsed: ParsedQuery,
  options: { bookId?: string; limit?: number; offset?: number } = {}
): SearchResponse {
  const limit = options.limit ?? 50
  const offset = options.offset ?? 0
  const bookFilter = options.bookId

  if (parsed.type === 'reference' && parsed.reference) {
    const { bookId, chapter, verse } = parsed.reference
    let matches = index.filter(
      (entry) =>
        entry.bookId === bookId &&
        entry.chapterNumber === chapter &&
        (!bookFilter || entry.bookId === bookFilter)
    )

    if (verse) {
      matches = matches.filter((entry) => entry.verse === verse)
    }

    const results = matches
      .slice(offset, offset + limit)
      .map((entry) => toResult(entry, [], undefined, 1000))

    return {
      results,
      total: matches.length,
      query: '',
      parsedAs: 'reference',
    }
  }

  const terms = parsed.terms
  const phrase = parsed.phrase

  if (terms.length === 0 && !phrase) {
    return { results: [], total: 0, query: '', parsedAs: 'text' }
  }

  const minTermLength = terms.some((t) => t.length >= 2) || !!phrase
  if (!minTermLength) {
    return { results: [], total: 0, query: '', parsedAs: 'text' }
  }

  const scored: SearchResult[] = []
  for (const entry of index) {
    if (bookFilter && entry.bookId !== bookFilter) continue
    const score = scoreEntry(entry, terms, phrase)
    if (score < 0) continue
    scored.push(toResult(entry, terms, phrase, score))
  }

  scored.sort((a, b) => b.score - a.score || a.fullReference.localeCompare(b.fullReference))

  return {
    results: scored.slice(offset, offset + limit).map((result) => ({
      ...result,
      snippet: highlightMatches(result.snippet, terms, phrase),
    })),
    total: scored.length,
    query: '',
    parsedAs: 'text',
  }
}
