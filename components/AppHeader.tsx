'use client'

import { BookOpen, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

interface AppHeaderProps {
  onOpenMenu: () => void
  onOpenSearch: () => void
  menuOpen: boolean
  searchOpen: boolean
}

export default function AppHeader({
  onOpenMenu,
  onOpenSearch,
  menuOpen,
  searchOpen,
}: AppHeaderProps) {
  return (
    <header
      data-read-aloud-ignore
      className="sticky top-0 z-40 backdrop-blur-md border-b border-beige-300/60 dark:border-brown-700/50 bg-beige-100/80 dark:bg-brown-950/80"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open book menu'}
            className="lg:hidden p-2 rounded-xl transition-all bg-white/70 text-beige-800 dark:bg-brown-800/80 dark:text-brown-100"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0 rounded-xl transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beige-600 dark:focus-visible:outline-brown-400"
            aria-label="The Book of Mormon — home"
          >
            <BookOpen
              className="w-8 h-8 shrink-0 text-beige-700 dark:text-brown-300"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-display font-bold truncate text-beige-900 dark:text-brown-50">
                The Book of Mormon
              </h1>
              <p className="text-xs md:text-sm font-sans truncate text-beige-600 dark:text-brown-400 hidden sm:block">
                Lamoni Edition · Reorganized Church
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSearch}
            aria-label={searchOpen ? 'Close search' : 'Search scripture'}
            className="hidden md:flex items-center gap-3 min-w-[12rem] max-w-xs lg:max-w-sm flex-1 px-3 py-2 rounded-xl font-sans text-sm transition-all text-left
              bg-white/70 hover:bg-white text-beige-600 border border-beige-300/80
              dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-300 dark:border-brown-600/60"
          >
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate flex-1">Search scripture…</span>
            <kbd className="hidden lg:inline font-sans text-[10px] px-1.5 py-0.5 rounded border border-beige-300/80 dark:border-brown-600 text-beige-500 dark:text-brown-400">
              Ctrl K
            </kbd>
          </button>
          <button
            onClick={onOpenSearch}
            aria-label={searchOpen ? 'Close search' : 'Search scripture'}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl font-sans text-sm transition-all
              bg-white/70 hover:bg-white text-beige-800
              dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-100"
          >
            <Search className="w-4 h-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
