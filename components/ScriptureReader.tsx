'use client'

import { ChevronLeft, ChevronRight, Eye, EyeOff, Home, List } from 'lucide-react'
import { useMemo, useState } from 'react'

interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

interface ScriptureReaderProps {
  bookName: string
  chapter: Chapter
  onBackToOverview: () => void
  onPrevChapter?: () => void
  onNextChapter?: () => void
  hasPrev: boolean
  hasNext: boolean
}

export default function ScriptureReader({
  bookName,
  chapter,
  onBackToOverview,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext,
}: ScriptureReaderProps) {
  const [showVerseNumbers, setShowVerseNumbers] = useState(true)

  const processedContent = useMemo(() => {
    if (showVerseNumbers) return chapter.content
    return chapter.content.replace(/<sup class="verse-num">\[\d+\]<\/sup>\s*/g, '')
  }, [chapter.content, showVerseNumbers])

  return (
    <article className="card-surface p-4 md:p-6 lg:p-10">
      <nav
        className="flex items-center gap-2 text-sm mb-4 font-sans text-beige-600 dark:text-brown-400"
        aria-label="Breadcrumb"
      >
        <button
          onClick={onBackToOverview}
          className="hover:text-beige-900 dark:hover:text-brown-50 flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Overview</span>
        </button>
        <span>/</span>
        <span className="text-beige-800 dark:text-brown-200">{bookName}</span>
        <span>/</span>
        <span className="font-medium text-beige-900 dark:text-brown-50">
          Chapter {chapter.number}
        </span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-beige-300 dark:border-brown-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            aria-label="Previous chapter"
            className={`p-2 rounded-lg transition-all ${
              hasPrev
                ? 'bg-white/70 hover:bg-white text-beige-800 dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-100'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            aria-label="Next chapter"
            className={`p-2 rounded-lg transition-all ${
              hasNext
                ? 'bg-white/70 hover:bg-white text-beige-800 dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-100'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-sm bg-white/70 hover:bg-white text-beige-800 dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-100"
          >
            <List className="w-4 h-4" />
            <span>Ch. {chapter.number}</span>
          </button>
        </div>
        <button
          onClick={() => setShowVerseNumbers(!showVerseNumbers)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-sm bg-white/70 hover:bg-white text-beige-800 dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-100"
        >
          {showVerseNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden sm:inline">{showVerseNumbers ? 'Hide' : 'Show'} Numbers</span>
        </button>
      </div>

      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-beige-900 dark:text-brown-50 mb-2">
          {chapter.reference}
        </h2>
        <p className="font-sans text-sm text-beige-600 dark:text-brown-400">
          {bookName} · Chapter {chapter.number}
        </p>
      </header>

      <div
        className="prose max-w-none mb-8 text-base md:text-lg leading-relaxed text-beige-900 dark:text-brown-100"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      <footer className="flex justify-between items-center pt-6 border-t border-beige-300 dark:border-brown-700">
        <button
          onClick={onPrevChapter}
          disabled={!hasPrev}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium ${
            hasPrev
              ? 'bg-white/70 hover:bg-white text-beige-800 dark:bg-brown-800/80 dark:text-brown-100'
              : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <span className="font-sans text-sm text-beige-600 dark:text-brown-400">
          Chapter {chapter.number}
        </span>
        <button
          onClick={onNextChapter}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium ${
            hasNext
              ? 'bg-white/70 hover:bg-white text-beige-800 dark:bg-brown-800/80 dark:text-brown-100'
              : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </article>
  )
}
