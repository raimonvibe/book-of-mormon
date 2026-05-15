'use client'

import Image from 'next/image'
import { BookOpen, Search, Sparkles } from 'lucide-react'

interface WelcomeHeroProps {
  title: string
  edition: string
  bookCount: number
  chapterCount: number
}

export default function WelcomeHero({
  title,
  edition,
  bookCount,
  chapterCount,
}: WelcomeHeroProps) {
  return (
    <section className="card-surface overflow-hidden">
      <div className="grid md:grid-cols-[minmax(240px,42%)_1fr]">
        <div className="relative h-52 sm:h-64 md:h-full md:min-h-[340px]">
          <Image
            src="/mormon.jpg"
            alt="The Book of Mormon — leather-bound volume with gold lettering"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 42vw"
            className="object-cover object-[center_65%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-beige-100 via-beige-100/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-beige-100/95 dark:from-brown-950 dark:via-brown-950/30 dark:to-brown-950/95"
            aria-hidden="true"
          />
        </div>

        <div className="relative p-6 md:p-10 flex flex-col justify-center text-center md:text-left">
          <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-beige-600 dark:text-brown-400" aria-hidden="true" />
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-beige-600 dark:text-brown-400">
              Scripture Reader
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-beige-900 dark:text-brown-50 mb-3 text-balance">
            {title}
          </h2>

          <p className="font-sans text-beige-600 dark:text-brown-400 max-w-lg mx-auto md:mx-0 mb-6 leading-relaxed">
            {edition}
          </p>

          <ul className="flex flex-wrap justify-center md:justify-start gap-3 mb-8 font-sans text-sm">
            <li className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-brown-800/60 text-beige-800 dark:text-brown-200">
              <Sparkles className="w-4 h-4 text-beige-600 dark:text-brown-400" aria-hidden="true" />
              {bookCount} books
            </li>
            <li className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-brown-800/60 text-beige-800 dark:text-brown-200">
              <BookOpen className="w-4 h-4 text-beige-600 dark:text-brown-400" aria-hidden="true" />
              {chapterCount} chapters
            </li>
            <li className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-brown-800/60 text-beige-800 dark:text-brown-200">
              <Search className="w-4 h-4 text-beige-600 dark:text-brown-400" aria-hidden="true" />
              Full-text search
            </li>
          </ul>

          <p className="font-sans text-beige-700 dark:text-brown-300">
            Choose a book from the menu to begin reading, or use search to find any word across
            all verses.
          </p>
        </div>
      </div>
    </section>
  )
}
