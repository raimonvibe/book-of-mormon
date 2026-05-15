'use client'

import { BookMarked, ChevronRight, ScrollText } from 'lucide-react'

interface Chapter {
  id: string
  number: string
  reference: string
}

interface Book {
  id: string
  name: string
  abbreviation: string
  section: string
  chapters: Chapter[]
}

interface BookMenuProps {
  books: Book[]
  selectedBookId: string | null
  selectedChapterId: string | null
  onSelectBook: (bookId: string) => void
  onSelectChapter: (bookId: string, chapterId: string) => void
  onClose?: () => void
}

const SECTIONS = ['Small Plates', "Mormon's Record"] as const

export default function BookMenu({
  books,
  selectedBookId,
  selectedChapterId,
  onSelectBook,
  onSelectChapter,
  onClose,
}: BookMenuProps) {
  const totalChapters = books.reduce((n, b) => n + b.chapters.length, 0)

  return (
    <nav className="card-surface p-4 md:p-5 h-full overflow-y-auto" aria-label="Book navigation">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-beige-300 dark:border-brown-700">
        <ScrollText className="w-5 h-5 text-beige-700 dark:text-brown-300" />
        <div>
          <h2 className="font-display font-bold text-lg text-beige-900 dark:text-brown-50">
            Books
          </h2>
          <p className="text-xs font-sans text-beige-600 dark:text-brown-400">
            {books.length} books · {totalChapters} chapters
          </p>
        </div>
      </div>

      {SECTIONS.map((section) => {
        const sectionBooks = books.filter((b) => b.section === section)
        if (!sectionBooks.length) return null

        return (
          <section key={section} className="mb-6">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-beige-600 dark:text-brown-400">
              {section}
            </h3>
            <ul className="space-y-1">
              {sectionBooks.map((book) => {
                const isBookOpen = selectedBookId === book.id
                return (
                  <li key={book.id}>
                    <button
                      onClick={() => onSelectBook(book.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all font-sans text-sm
                        ${
                          isBookOpen
                            ? 'bg-beige-300/80 text-beige-900 dark:bg-brown-700 dark:text-brown-50'
                            : 'hover:bg-white/80 text-beige-800 dark:hover:bg-brown-800/60 dark:text-brown-200'
                        }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <BookMarked className="w-4 h-4 shrink-0 opacity-70" />
                        <span className="font-medium truncate">{book.name}</span>
                      </span>
                      <span className="text-xs opacity-70 shrink-0">{book.chapters.length} ch</span>
                    </button>

                    {isBookOpen && (
                      <ul className="mt-1 ml-2 pl-3 border-l-2 border-beige-300 dark:border-brown-600 space-y-0.5 max-h-48 overflow-y-auto">
                        {book.chapters.map((ch) => (
                          <li key={ch.id}>
                            <button
                              onClick={() => {
                                onSelectChapter(book.id, ch.id)
                                onClose?.()
                              }}
                              className={`w-full flex items-center gap-1 px-2 py-1.5 rounded-lg text-left text-xs font-sans transition-all
                                ${
                                  selectedChapterId === ch.id
                                    ? 'bg-beige-400/50 text-beige-900 dark:bg-brown-600 dark:text-brown-50 font-semibold'
                                    : 'text-beige-700 hover:bg-white/60 dark:text-brown-300 dark:hover:bg-brown-800/40'
                                }`}
                            >
                              <ChevronRight className="w-3 h-3 shrink-0" />
                              Chapter {ch.number}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}
