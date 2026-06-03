'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import LoadingScreen from '@/components/LoadingScreen'
import WelcomeHero from '@/components/WelcomeHero'
import OverviewBookGrid from '@/components/OverviewBookGrid'
import BookMenu from '@/components/BookMenu'
import ChapterOverview from '@/components/ChapterOverview'
import ScriptureReader from '@/components/ScriptureReader'
import SearchPanel from '@/components/SearchPanel'
import SiteFooter from '@/components/SiteFooter'
import {
  bookPath,
  chapterPath,
  findBookBySlug,
  parseSlugSegments,
} from '@/lib/routes'

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

export default function BookReaderApp() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug

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

  const syncFromUrl = useCallback(
    (books: Book[]) => {
      const segments = parseSlugSegments(slug as string | string[] | undefined)

      if (segments.length === 0) {
        setView('overview')
        setSelectedBookId(null)
        setSelectedChapterId(null)
        return
      }

      const book = findBookBySlug(books, segments[0])
      if (!book) {
        router.replace('/')
        return
      }

      if (segments.length === 1) {
        setSelectedBookId(book.id)
        setSelectedChapterId(null)
        setView('chapters')
        return
      }

      const chapter = book.chapters.find((c) => c.number === segments[1])
      if (!chapter) {
        router.replace(bookPath(book))
        return
      }

      setSelectedBookId(book.id)
      setSelectedChapterId(chapter.id)
      setView('reader')
    },
    [slug, router]
  )

  useEffect(() => {
    if (data) syncFromUrl(data.books)
  }, [data, syncFromUrl])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('read-aloud-stop'))
  }, [selectedChapterId, view, selectedBookId])

  const selectedBook = data?.books.find((b) => b.id === selectedBookId) ?? null
  const selectedChapter =
    selectedBook?.chapters.find((c) => c.id === selectedChapterId) ?? null

  useEffect(() => {
    const base = 'Book of Mormon Reader'
    if (view === 'reader' && selectedChapter) {
      document.title = `${selectedChapter.reference} | ${base}`
    } else if (view === 'chapters' && selectedBook) {
      document.title = `${selectedBook.name} | ${base}`
    } else {
      document.title = base
    }
  }, [view, selectedBook, selectedChapter])

  const navigateTo = useCallback(
    (bookId: string, chapterId: string) => {
      const book = data?.books.find((b) => b.id === bookId)
      const chapter = book?.chapters.find((c) => c.id === chapterId)
      if (!book || !chapter) return
      setMenuOpen(false)
      router.push(chapterPath(book, chapter))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [data, router]
  )

  const handleSelectBook = useCallback(
    (bookId: string) => {
      const book = data?.books.find((b) => b.id === bookId)
      if (!book) return
      setMenuOpen(false)
      router.push(bookPath(book))
    },
    [data, router]
  )

  const handleSelectChapter = useCallback(
    (chapterId: string) => {
      if (!selectedBookId) return
      navigateTo(selectedBookId, chapterId)
    },
    [selectedBookId, navigateTo]
  )

  const goPrev = useCallback(() => {
    if (!data || !selectedBook || !selectedChapterId) return
    const idx = selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
    if (idx > 0) {
      router.push(chapterPath(selectedBook, selectedBook.chapters[idx - 1]))
    } else {
      const bookIdx = data.books.findIndex((b) => b.id === selectedBook.id)
      if (bookIdx > 0) {
        const prev = data.books[bookIdx - 1]
        const ch = prev.chapters[prev.chapters.length - 1]
        router.push(chapterPath(prev, ch))
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [data, selectedBook, selectedChapterId, router])

  const goNext = useCallback(() => {
    if (!data || !selectedBook || !selectedChapterId) return
    const idx = selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
    if (idx < selectedBook.chapters.length - 1) {
      router.push(chapterPath(selectedBook, selectedBook.chapters[idx + 1]))
    } else {
      const bookIdx = data.books.findIndex((b) => b.id === selectedBook.id)
      if (bookIdx < data.books.length - 1) {
        const next = data.books[bookIdx + 1]
        router.push(chapterPath(next, next.chapters[0]))
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [data, selectedBook, selectedChapterId, router])

  const chapterIdx = selectedBook
    ? selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
    : -1
  const bookIdx =
    data && selectedBook ? data.books.findIndex((b) => b.id === selectedBook.id) : -1
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start">
          <aside
            data-read-aloud-ignore
            className={`lg:block ${menuOpen ? 'block' : 'hidden'} mb-6 lg:mb-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden`}
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

          <div className="flex flex-col gap-6 min-w-0">
            {view === 'overview' && (
              <>
                <WelcomeHero
                  title={data.title}
                  edition={data.edition}
                  bookCount={data.books.length}
                  chapterCount={totalChapters}
                />
                <OverviewBookGrid books={data.books} onSelectBook={handleSelectBook} />
              </>
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
                onBackToChapters={() => router.push(bookPath(selectedBook))}
                onPrevChapter={goPrev}
                onNextChapter={goNext}
                hasPrev={!!hasPrev}
                hasNext={!!hasNext}
              />
            )}
          </div>
        </div>
      </div>

      <SiteFooter bookCount={data.books.length} chapterCount={totalChapters} />
    </>
  )
}
