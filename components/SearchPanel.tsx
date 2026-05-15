'use client'

import { useMemo, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'

export interface SearchResult {
  bookId: string
  bookName: string
  chapterId: string
  chapterNumber: string
  reference: string
  verse: string
  text: string
}

interface SearchPanelProps {
  open: boolean
  onClose: () => void
  onSelectResult: (bookId: string, chapterId: string) => void
}

export default function SearchPanel({ open, onClose, onSelectResult }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const q = query.trim()
    if (q.length < 2) return

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const highlight = useMemo(() => {
    const q = query.trim()
    if (!q) return (text: string) => text
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return (text: string) =>
      text.replace(re, '<mark class="search-hit">$1</mark>')
  }, [query])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 md:pt-24"
      role="dialog"
      aria-label="Search scripture"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl card-surface p-4 md:p-6 max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-beige-900 dark:text-brown-50 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Scripture
          </h2>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-2 rounded-lg hover:bg-beige-200 dark:hover:bg-brown-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words across all chapters..."
            autoFocus
            className="flex-1 px-4 py-3 rounded-xl font-sans text-sm border outline-none focus:ring-2
              bg-white border-beige-300 text-beige-900 focus:ring-beige-400
              dark:bg-brown-900 dark:border-brown-600 dark:text-brown-50 dark:focus:ring-brown-500"
          />
          <button
            type="submit"
            disabled={loading || query.trim().length < 2}
            className="px-4 py-3 rounded-xl font-sans font-medium text-sm transition-all disabled:opacity-50
              bg-beige-600 text-white hover:bg-beige-700
              dark:bg-brown-600 dark:text-brown-50 dark:hover:bg-brown-500"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {loading && (
            <p className="text-center py-8 font-sans text-sm text-beige-600 dark:text-brown-400">
              Searching {query}...
            </p>
          )}
          {!loading && searched && results.length === 0 && (
            <p className="text-center py-8 font-sans text-sm text-beige-600 dark:text-brown-400">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {!loading && results.length > 0 && (
            <p className="font-sans text-xs mb-3 text-beige-600 dark:text-brown-400">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
          )}
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={`${r.chapterId}-${r.verse}-${i}`}>
                <button
                  onClick={() => {
                    onSelectResult(r.bookId, r.chapterId)
                    onClose()
                  }}
                  className="w-full text-left p-3 rounded-xl transition-all hover:bg-white/90 dark:hover:bg-brown-800/80"
                >
                  <div className="font-sans text-xs font-semibold mb-1 text-beige-600 dark:text-brown-400">
                    {r.reference} · Verse {r.verse}
                  </div>
                  <p
                    className="text-sm leading-relaxed text-beige-800 dark:text-brown-200"
                    dangerouslySetInnerHTML={{ __html: highlight(r.text) }}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
