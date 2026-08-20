import type { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n'
import './globals.css'

const t = getDictionary()

export const metadata: Metadata = {
  title: t.app.name,
  description: t.app.tagline,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body className="antialiased">{children}</body>
    </html>
  )
}
