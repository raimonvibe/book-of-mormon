'use client'

import { BookMarked, ChevronRight } from 'lucide-react'

interface Book {
  id: string
  name: string
  abbreviation: string
  section: string
  chapters: { id: string }[]
}

interface OverviewBookGridProps {
  books: Book[]
  onSelectBook: (bookId: string) => void
}

const SECTIONS = ['Small Plates', "Mormon's Record"] as const

export default function OverviewBookGrid({ books, onSelectBook }: OverviewBookGridProps) {
  return (
    <section className="card-surface p-5 md:p-6" aria-label="Browse all books">
      <h3 className="font-display text-xl font-bold text-beige-900 dark:text-brown-50 mb-1">
        Browse all books
      </h3>
      <p className="font-sans text-sm text-beige-600 dark:text-brown-400 mb-5">
        Select any book to view its chapters and start reading.
      </p>

      {SECTIONS.map((section) => {
        const sectionBooks = books.filter((b) => b.section === section)
        if (!sectionBooks.length) return null

        return (
          <div key={section} className="mb-6 last:mb-0">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-beige-600 dark:text-brown-400 mb-3">
              {section}
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 list-none p-0 m-0">
              {sectionBooks.map((book) => (
                <li key={book.id}>
                  <button
                    type="button"
                    onClick={() => onSelectBook(book.id)}
                    className="group w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                      bg-white/60 hover:bg-white dark:bg-brown-800/50 dark:hover:bg-brown-700/80
                      border border-beige-200/80 dark:border-brown-600/50 hover:shadow-md"
                  >
                    <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-beige-200/80 dark:bg-brown-700 text-beige-700 dark:text-brown-200">
                      <BookMarked className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-sans font-medium text-sm text-beige-900 dark:text-brown-50 truncate">
                        {book.name}
                      </span>
                      <span className="block font-sans text-xs text-beige-600 dark:text-brown-400">
                        {book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''}
                      </span>
                    </span>
                    <ChevronRight
                      className="w-4 h-4 shrink-0 text-beige-500 dark:text-brown-500 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
