'use client'

import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="relative w-40 h-52 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-beige-300/50 dark:ring-brown-600/50">
          <Image
            src="/mormon.jpg"
            alt=""
            fill
            className="object-cover object-[center_65%]"
            sizes="160px"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-beige-100/90 to-transparent dark:from-brown-950/90"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-beige-700 dark:text-brown-300 drop-shadow-md" />
          </div>
        </div>
        <p className="font-display text-xl font-semibold text-beige-800 dark:text-brown-100 mb-1">
          The Book of Mormon
        </p>
        <p className="font-sans text-sm text-beige-600 dark:text-brown-400">Preparing scripture...</p>
      </div>
    </main>
  )
}
