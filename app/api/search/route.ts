import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import {
  buildBookLookup,
  parseSearchQuery,
  searchEntries,
  type BookMeta,
  type SearchEntry,
} from '@/lib/search'

let cachedIndex: SearchEntry[] | null = null
let cachedBooks: BookMeta[] | null = null

function getIndex(): SearchEntry[] {
  if (!cachedIndex) {
    const filePath = path.join(process.cwd(), 'data', 'search-index.json')
    cachedIndex = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }
  return cachedIndex!
}

function getBooks(): BookMeta[] {
  if (!cachedBooks) {
    const filePath = path.join(process.cwd(), 'data', 'book-of-mormon-data.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    cachedBooks = data.books.map((book: BookMeta) => ({
      id: book.id,
      name: book.name,
      abbreviation: book.abbreviation,
    }))
  }
  return cachedBooks!
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const q = params.get('q')?.trim() ?? ''
  const bookId = params.get('book')?.trim() || undefined
  const limit = Math.min(Math.max(Number(params.get('limit') ?? 50), 1), 100)
  const offset = Math.max(Number(params.get('offset') ?? 0), 0)

  if (q.length < 2) {
    return NextResponse.json({ results: [], total: 0, parsedAs: 'text', query: q })
  }

  const bookLookup = buildBookLookup(getBooks())
  const parsed = parseSearchQuery(q, bookLookup)
  const response = searchEntries(getIndex(), parsed, { bookId, limit, offset })

  return NextResponse.json({
    ...response,
    query: q,
  })
}
