'use client'

import { useCallback, useEffect, useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import BookMenu from '@/components/BookMenu'
import ChapterOverview from '@/components/ChapterOverview'
import ScriptureReader from '@/components/ScriptureReader'
import SearchPanel from '@/components/SearchPanel'

interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

interface Book {
  id: string
  name: string
  abbreviation: string
  section: string
  chapters: Chapter[]
}

interface BomData {
  title: string
  edition: string
  books: Book[]
}

type View = 'overview' | 'chapters' | 'reader'

export default function Home() {
  const [data, setData] = useState<BomData | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [view, setView] = useState<View>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    fetch('/api/bom-data')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  const selectedBook = data?.books.find((b) => b.id === selectedBookId) ?? null
  const selectedChapter =
    selectedBook?.chapters.find((c) => c.id === selectedChapterId) ?? null

  const navigateTo = useCallback((bookId: string, chapterId: string) => {
    setSelectedBookId(bookId)
    setSelectedChapterId(chapterId)
    setView('reader')
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId)
    setSelectedChapterId(null)
    setView('chapters')
    setMenuOpen(false)
  }

  const handleSelectChapter = (chapterId: string) => {
    if (!selectedBookId) return
    navigateTo(selectedBookId, chapterId)
  }

  const goPrev = () => {
    if (!data || !selectedBook || !selectedChapterId) return
    const idx = selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
    if (idx > 0) {
      setSelectedChapterId(selectedBook.chapters[idx - 1].id)
    } else {
      const bookIdx = data.books.findIndex((b) => b.id === selectedBook.id)
      if (bookIdx > 0) {
        const prev = data.books[bookIdx - 1]
        setSelectedBookId(prev.id)
        setSelectedChapterId(prev.chapters[prev.chapters.length - 1].id)
      }
    }
  }

  const goNext = () => {
    if (!data || !selectedBook || !selectedChapterId) return
    const idx = selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
    if (idx < selectedBook.chapters.length - 1) {
      setSelectedChapterId(selectedBook.chapters[idx + 1].id)
    } else {
      const bookIdx = data.books.findIndex((b) => b.id === selectedBook.id)
      if (bookIdx < data.books.length - 1) {
        const next = data.books[bookIdx + 1]
        setSelectedBookId(next.id)
        setSelectedChapterId(next.chapters[0].id)
      }
    }
  }

  const chapterIdx = selectedBook
    ? selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
    : -1
  const bookIdx = data && selectedBook ? data.books.findIndex((b) => b.id === selectedBook.id) : -1
  const hasPrev = chapterIdx > 0 || bookIdx > 0
  const hasNext =
    selectedBook &&
    data &&
    (chapterIdx < selectedBook.chapters.length - 1 || bookIdx < data.books.length - 1)

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-beige-600 dark:text-brown-400" />
          <p className="font-sans text-lg text-beige-700 dark:text-brown-300">
            Loading the Book of Mormon...
          </p>
        </div>
      </main>
    )
  }

  const totalChapters = data.books.reduce((n, b) => n + b.chapters.length, 0)

  return (
    <>
      <AppHeader
        onOpenMenu={() => setMenuOpen((o) => !o)}
        onOpenSearch={() => setSearchOpen(true)}
        menuOpen={menuOpen}
        searchOpen={searchOpen}
      />

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={navigateTo}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside
            className={`lg:block ${menuOpen ? 'block' : 'hidden'} mb-6 lg:mb-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)]`}
          >
            <BookMenu
              books={data.books}
              selectedBookId={selectedBookId}
              selectedChapterId={selectedChapterId}
              onSelectBook={handleSelectBook}
              onSelectChapter={navigateTo}
              onClose={() => setMenuOpen(false)}
            />
          </aside>

          <div>
            {view === 'overview' && (
              <div className="card-surface p-6 md:p-10 text-center">
                <BookOpen className="w-14 h-14 mx-auto mb-4 text-beige-700 dark:text-brown-300" />
                <h2 className="text-3xl md:text-4xl font-display font-bold text-beige-900 dark:text-brown-50 mb-3">
                  {data.title}
                </h2>
                <p className="font-sans text-beige-600 dark:text-brown-400 max-w-xl mx-auto mb-6">
                  {data.edition}
                </p>
                <p className="font-sans text-sm text-beige-500 dark:text-brown-500">
                  {data.books.length} books · {totalChapters} chapters · Search across all
                  verses
                </p>
                <p className="mt-8 font-sans text-beige-700 dark:text-brown-300">
                  Select a book from the menu to begin reading.
                </p>
              </div>
            )}

            {view === 'chapters' && selectedBook && (
              <ChapterOverview
                book={selectedBook}
                selectedChapterId={selectedChapterId}
                onSelectChapter={handleSelectChapter}
              />
            )}

            {view === 'reader' && selectedBook && selectedChapter && (
              <ScriptureReader
                bookName={selectedBook.name}
                chapter={selectedChapter}
                onBackToOverview={() => {
                  setView('chapters')
                  setSelectedChapterId(null)
                }}
                onPrevChapter={goPrev}
                onNextChapter={goNext}
                hasPrev={!!hasPrev}
                hasNext={!!hasNext}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-8 font-sans text-sm text-beige-600 dark:text-brown-500">
        {data.title} · Lamoni Edition · {data.books.length} books · {totalChapters} chapters
      </footer>
    </>
  )
}
