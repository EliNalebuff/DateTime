import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DateFinder AI - Plan the Perfect Date',
  description: 'AI-powered matchmaking and date planning tool. Plan a custom date that is fast, fun, and personal.',
  keywords: ['dating', 'ai', 'matchmaking', 'date planning', 'romance'],
  authors: [{ name: 'DateFinder AI' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#e86875',
  openGraph: {
    title: 'DateFinder AI - Plan the Perfect Date',
    description: 'AI-powered matchmaking and date planning tool',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DateFinder AI - Plan the Perfect Date',
    description: 'AI-powered matchmaking and date planning tool',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-romantic min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 py-6">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p className="text-sm">
                © 2024 DateFinder AI. Made with ❤️ for better connections.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 