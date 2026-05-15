import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://book-of-mormon-tan.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Book of Mormon Reader',
  description:
    'Read the Book of Mormon — Lamoni Edition. Search scripture, browse books and chapters, light and dark themes.',
  keywords: ['Book of Mormon', 'Scripture', 'Lamoni', 'Nephi', 'Alma'],
  applicationName: 'Book of Mormon Reader',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/social.png', sizes: '444x513', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Book of Mormon',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Book of Mormon Reader',
    description:
      'Read the Book of Mormon — Lamoni Edition with search, chapter navigation, and beautiful reading themes.',
    url: siteUrl,
    siteName: 'Book of Mormon Reader',
    images: [
      {
        url: '/social.png',
        width: 444,
        height: 513,
        alt: 'Book of Mormon Reader',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book of Mormon Reader',
    description:
      'Read the Book of Mormon — Lamoni Edition with search, chapter navigation, and beautiful reading themes.',
    images: ['/social.png'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f1e8' },
    { media: '(prefers-color-scheme: dark)', color: '#2c1f14' },
  ],
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
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
