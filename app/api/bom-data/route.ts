import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ChapterJson {
  id: string
  number: string
  reference: string
  content: string
}

interface BookJson {
  id: string
  name: string
  abbreviation: string
  section: string
  chapters: ChapterJson[]
}

interface BomJson {
  title: string
  edition: string
  books: BookJson[]
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'book-of-mormon-data.json')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as BomJson

  const books = data.books.map((book) => ({
    id: book.id,
    name: book.name,
    abbreviation: book.abbreviation,
    section: book.section,
    chapters: book.chapters.map((ch) => ({
      id: ch.id,
      number: ch.number,
      reference: ch.reference,
      content: ch.content,
    })),
  }))

  return NextResponse.json({
    title: data.title,
    edition: data.edition,
    books,
  })
}
