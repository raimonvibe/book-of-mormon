'use client'

import { BookOpen, Hash } from 'lucide-react'

interface Chapter {
  id: string
  number: string
  reference: string
}

interface Book {
  id: string
  name: string
  chapters: Chapter[]
}

interface ChapterOverviewProps {
  book: Book
  selectedChapterId: string | null
  onSelectChapter: (chapterId: string) => void
}

export default function ChapterOverview({
  book,
  selectedChapterId,
  onSelectChapter,
}: ChapterOverviewProps) {
  return (
    <section className="card-surface p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-beige-300 dark:border-brown-700">
        <BookOpen className="w-7 h-7 text-beige-700 dark:text-brown-300" />
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-900 dark:text-brown-50">
            {book.name}
          </h2>
          <p className="text-sm font-sans text-beige-600 dark:text-brown-400">
            {book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''} — select to read
          </p>
        </div>
      </div>

      <nav aria-label={`Chapters in ${book.name}`}>
        <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
          {book.chapters.map((ch) => (
            <li key={ch.id}>
              <button
                onClick={() => onSelectChapter(ch.id)}
                aria-label={`Read ${ch.reference}`}
                aria-current={selectedChapterId === ch.id ? 'page' : undefined}
                className={`w-full aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg font-sans
                  ${
                    selectedChapterId === ch.id
                      ? 'bg-gradient-to-br from-beige-400 to-beige-600 text-white shadow-lg scale-105 dark:from-brown-600 dark:to-brown-800'
                      : 'bg-white/70 hover:bg-white text-beige-800 dark:bg-brown-800/60 dark:hover:bg-brown-700 dark:text-brown-100'
                  }`}
              >
                <Hash className="w-4 h-4 mb-1 opacity-70" aria-hidden="true" />
                <span className="text-lg font-bold">{ch.number}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
