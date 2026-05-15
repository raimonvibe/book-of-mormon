import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface SearchEntry {
  bookId: string
  bookName: string
  chapterId: string
  chapterNumber: string
  reference: string
  verse: string
  text: string
}

let cachedIndex: SearchEntry[] | null = null

function getIndex(): SearchEntry[] {
  if (!cachedIndex) {
    const filePath = path.join(process.cwd(), 'data', 'search-index.json')
    cachedIndex = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }
  return cachedIndex!
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const index = getIndex()
  const words = q.split(/\s+/).filter(Boolean)

  const results = index
    .filter((entry) => {
      const haystack = entry.text.toLowerCase()
      return words.every((w) => haystack.includes(w))
    })
    .slice(0, 100)

  return NextResponse.json({ results, total: results.length })
}
