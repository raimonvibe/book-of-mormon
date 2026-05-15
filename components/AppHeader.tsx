'use client'

import { BookOpen, Menu, Search, X } from 'lucide-react'
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
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-beige-300/60 dark:border-brown-700/50 bg-beige-100/80 dark:bg-brown-950/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open book menu'}
            className="lg:hidden p-2 rounded-xl transition-all bg-white/70 text-beige-800 dark:bg-brown-800/80 dark:text-brown-100"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSearch}
            aria-label={searchOpen ? 'Close search' : 'Search scripture'}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-sans text-sm transition-all
              bg-white/70 hover:bg-white text-beige-800
              dark:bg-brown-800/80 dark:hover:bg-brown-700 dark:text-brown-100"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
