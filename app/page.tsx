'use client'

import { useCallback, useEffect, useState } from 'react'
import AppHeader from '@/components/AppHeader'
import LoadingScreen from '@/components/LoadingScreen'
import WelcomeHero from '@/components/WelcomeHero'
import BookMenu from '@/components/BookMenu'
import ChapterOverview from '@/components/ChapterOverview'
import ScriptureReader from '@/components/ScriptureReader'
import SearchPanel from '@/components/SearchPanel'
import SiteFooter from '@/components/SiteFooter'

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
      <>
        <LoadingScreen />
        <SiteFooter />
      </>
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
              <WelcomeHero
                title={data.title}
                edition={data.edition}
                bookCount={data.books.length}
                chapterCount={totalChapters}
              />
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

      <SiteFooter bookCount={data.books.length} chapterCount={totalChapters} />
    </>
  )
}
