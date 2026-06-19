/** Canonical site URL (set NEXT_PUBLIC_SITE_URL in production if the host changes). */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://book-of-mormon-tan.vercel.app'
  )
}
