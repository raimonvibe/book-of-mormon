import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://book-of-mormon-tan.vercel.app'),
  title: 'Book of Mormon Reader',
  description:
    'Read the Book of Mormon — Lamoni Edition. Search scripture, browse books and chapters, light and dark themes.',
  keywords: ['Book of Mormon', 'Scripture', 'Lamoni', 'Nephi', 'Alma'],
  openGraph: {
    title: 'Book of Mormon Reader',
    description:
      'Read the Book of Mormon — Lamoni Edition with search, chapter navigation, and beautiful reading themes.',
    images: [{ url: '/mormon.jpg', width: 1200, height: 1600, alt: 'The Book of Mormon' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book of Mormon Reader',
    images: ['/mormon.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
