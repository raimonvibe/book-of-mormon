interface SiteFooterProps {
  bookCount?: number
  chapterCount?: number
}

const SOCIAL_LINKS = [
  {
    href: 'https://x.com/raimonvibe/',
    label: 'X',
    icon: 'fa-brands fa-x-twitter',
    className:
      'bg-beige-700 hover:bg-blue-500 dark:bg-slate-700 dark:hover:bg-blue-500',
  },
  {
    href: 'https://www.youtube.com/channel/UCDGDNuYb2b2Ets9CYCNVbuA/videos/',
    label: 'YouTube',
    icon: 'fab fa-youtube',
    className:
      'bg-beige-700 hover:bg-red-500 dark:bg-red-900/80 dark:hover:bg-red-500',
  },
  {
    href: 'https://www.tiktok.com/@raimonvibe/',
    label: 'TikTok',
    icon: 'fab fa-tiktok',
    className:
      'bg-beige-700 hover:bg-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-500',
  },
  {
    href: 'https://www.instagram.com/raimonvibe/',
    label: 'Instagram',
    icon: 'fab fa-instagram',
    className:
      'bg-beige-700 hover:bg-pink-500 dark:bg-pink-900/80 dark:hover:bg-pink-500',
  },
  {
    href: 'https://medium.com/@raimonvibe/',
    label: 'Medium',
    icon: 'fab fa-medium',
    className:
      'bg-beige-700 hover:bg-green-600 dark:bg-green-900/80 dark:hover:bg-green-500',
  },
  {
    href: 'https://github.com/raimonvibe/',
    label: 'GitHub',
    icon: 'fab fa-github',
    className:
      'bg-beige-700 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-400',
  },
  {
    href: 'https://www.linkedin.com/in/raimonvibe/',
    label: 'LinkedIn',
    icon: 'fab fa-linkedin-in',
    className:
      'bg-beige-700 hover:bg-blue-600 dark:bg-blue-900/80 dark:hover:bg-blue-500',
  },
  {
    href: 'https://www.facebook.com/profile.php?id=61563450007849',
    label: 'Facebook',
    icon: 'fab fa-facebook-f',
    className:
      'bg-beige-700 hover:bg-blue-700 dark:bg-blue-950/80 dark:hover:bg-blue-600',
  },
] as const

export default function SiteFooter({ bookCount, chapterCount }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-beige-300/80 dark:border-brown-700/80 bg-gradient-to-b from-transparent to-beige-200/40 dark:to-brown-950/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h5 className="font-display font-semibold text-lg text-beige-900 dark:text-brown-50 mb-3">
              The Book of Mormon Reader
            </h5>
            {bookCount != null && chapterCount != null && (
              <p className="font-sans text-sm text-beige-600 dark:text-brown-400 mb-4">
                Lamoni Edition · {bookCount} books · {chapterCount} chapters
              </p>
            )}
            <p className="font-sans text-sm text-beige-600 dark:text-brown-400 leading-relaxed">
              Cover photo by{' '}
              <a
                href="https://www.pexels.com/@chris-f-38966/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-beige-800 dark:text-brown-200 underline underline-offset-2 hover:text-beige-900 dark:hover:text-brown-50 transition-colors"
              >
                Chris F
              </a>{' '}
              on{' '}
              <a
                href="https://www.pexels.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-beige-800 dark:text-brown-200 underline underline-offset-2 hover:text-beige-900 dark:hover:text-brown-50 transition-colors"
              >
                Pexels
              </a>
            </p>
          </div>

          <div>
            <h5 className="font-display font-semibold text-lg text-beige-900 dark:text-brown-50 mb-4">
              Connect with Raimon
            </h5>
            <ul className="grid grid-cols-4 gap-3 list-none p-0 m-0">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 text-white shadow-md [&_i]:text-white ${link.className}`}
                  >
                    <i className={link.icon} aria-hidden="true" />
                    <span className="sr-only">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-beige-300/80 dark:border-brown-700/80 mt-8 pt-8 text-center">
          <p className="font-sans text-sm text-beige-600 dark:text-brown-400">
            &copy; {year}{' '}
            <a
              href="https://github.com/raimonvibe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-beige-800 dark:text-brown-200 hover:underline"
            >
              raimonvibe
            </a>
            . MIT License.
          </p>
        </div>
      </div>
    </footer>
  )
}
