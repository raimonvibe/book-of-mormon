'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Loader2, Search, X } from 'lucide-react'

export interface SearchResult {
  bookId: string
  bookName: string
  chapterId: string
  chapterNumber: string
  reference: string
  verse: string
  text: string
  fullReference: string
  snippet: string
  score: number
}

interface BookOption {
  id: string
  name: string
}

interface SearchPanelProps {
  open: boolean
  onClose: () => void
  onSelectResult: (bookId: string, chapterId: string, verse: string) => void
  books: BookOption[]
}

const PAGE_SIZE = 50

export default function SearchPanel({
  open,
  onClose,
  onSelectResult,
  books,
}: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [bookFilter, setBookFilter] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [parsedAs, setParsedAs] = useState<'reference' | 'text'>('text')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const runSearch = useCallback(
    async (q: string, book: string, offset = 0, append = false) => {
      const trimmed = q.trim()
      if (trimmed.length < 2) {
        setResults([])
        setTotal(0)
        setSearched(false)
        setLoading(false)
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setSearched(true)
      if (!append) setActiveIndex(0)

      try {
        const params = new URLSearchParams({
          q: trimmed,
          limit: String(PAGE_SIZE),
          offset: String(offset),
        })
        if (book) params.set('book', book)

        const res = await fetch(`/api/search?${params}`, { signal: controller.signal })
        const data = await res.json()

        if (controller.signal.aborted) return

        setParsedAs(data.parsedAs ?? 'text')
        setTotal(data.total ?? 0)
        setResults((prev) =>
          append ? [...prev, ...(data.results ?? [])] : (data.results ?? [])
        )
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (!append) {
          setResults([])
          setTotal(0)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    setActiveIndex(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      runSearch(query, bookFilter)
    }, 280)
    return () => window.clearTimeout(timer)
  }, [query, bookFilter, open, runSearch])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onSelectResult(result.bookId, result.chapterId, result.verse)
      onClose()
    },
    [onSelectResult, onClose]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    }
  }

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const hasMore = results.length < total
  const resultLabel = useMemo(() => {
    if (!searched || loading) return null
    if (total === 0) return `No results for “${query.trim()}”`
    const shown = results.length
    const suffix = parsedAs === 'reference' ? ' (reference)' : ''
    if (shown < total) return `${shown} of ${total} results${suffix}`
    return `${total} result${total !== 1 ? 's' : ''}${suffix}`
  }, [searched, loading, total, results.length, query, parsedAs])

  if (!open) return null

  return (
    <div
      data-read-aloud-ignore
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-16 sm:pt-20 md:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search scripture"
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl card-surface p-4 md:p-5 max-h-[85vh] flex flex-col shadow-2xl ring-1 ring-beige-300/60 dark:ring-brown-600/50">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-beige-900 dark:text-brown-50 flex items-center gap-2">
              <Search className="w-5 h-5" aria-hidden="true" />
              Search Scripture
            </h2>
            <p className="mt-1 font-sans text-xs text-beige-600 dark:text-brown-400">
              Try a reference like <span className="font-medium">1 Nephi 3:7</span> or words like{' '}
              <span className="font-medium">&quot;faith and hope&quot;</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-2 rounded-lg hover:bg-beige-200 dark:hover:bg-brown-700 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-500 dark:text-brown-500 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by words or reference…"
              autoComplete="off"
              spellCheck={false}
              className="w-full pl-10 pr-10 py-3 rounded-xl font-sans text-sm border outline-none focus:ring-2
                bg-white border-beige-300 text-beige-900 focus:ring-beige-400
                dark:bg-brown-900 dark:border-brown-600 dark:text-brown-50 dark:focus:ring-brown-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-beige-100 dark:hover:bg-brown-800"
              >
                <X className="w-4 h-4 text-beige-500 dark:text-brown-400" />
              </button>
            )}
          </div>
          <label className="sr-only" htmlFor="search-book-filter">
            Filter by book
          </label>
          <select
            id="search-book-filter"
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            className="px-3 py-3 rounded-xl font-sans text-sm border outline-none focus:ring-2 min-w-[9rem]
              bg-white border-beige-300 text-beige-900 focus:ring-beige-400
              dark:bg-brown-900 dark:border-brown-600 dark:text-brown-50 dark:focus:ring-brown-500"
          >
            <option value="">All books</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2 min-h-[1.25rem]">
          {loading ? (
            <p className="font-sans text-xs text-beige-600 dark:text-brown-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Searching…
            </p>
          ) : (
            <p className="font-sans text-xs text-beige-600 dark:text-brown-400">{resultLabel}</p>
          )}
          <p className="font-sans text-[11px] text-beige-500 dark:text-brown-500 hidden sm:block">
            ↑↓ navigate · Enter open · Esc close
          </p>
        </div>

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {!loading && searched && results.length === 0 && (
            <div className="text-center py-10 px-4">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-beige-400 dark:text-brown-600" />
              <p className="font-sans text-sm text-beige-700 dark:text-brown-300">
                No matching verses found.
              </p>
              <p className="mt-1 font-sans text-xs text-beige-500 dark:text-brown-500">
                Check spelling, try fewer words, or search a reference like Alma 32:21.
              </p>
            </div>
          )}

          <ul ref={listRef} className="space-y-1.5" role="listbox" aria-label="Search results">
            {results.map((result, index) => (
              <li key={`${result.chapterId}-${result.verse}-${index}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  data-active={index === activeIndex}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full text-left p-3 rounded-xl transition-all border border-transparent ${
                    index === activeIndex
                      ? 'bg-white ring-1 ring-beige-300 dark:bg-brown-800 dark:ring-brown-600'
                      : 'hover:bg-white/90 dark:hover:bg-brown-800/80'
                  }`}
                >
                  <div className="font-sans text-xs font-semibold mb-1 text-beige-600 dark:text-brown-400">
                    {result.fullReference}
                  </div>
                  <p
                    className="text-sm leading-relaxed text-beige-800 dark:text-brown-200 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: result.snippet }}
                  />
                </button>
              </li>
            ))}
          </ul>

          {hasMore && !loading && (
            <div className="pt-3 pb-1 text-center">
              <button
                type="button"
                onClick={() => runSearch(query, bookFilter, results.length, true)}
                className="px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all
                  bg-beige-600 text-white hover:bg-beige-700
                  dark:bg-brown-600 dark:text-brown-50 dark:hover:bg-brown-500"
              >
                Load more ({total - results.length} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
