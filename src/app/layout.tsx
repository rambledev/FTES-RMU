import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'ระบบประเมินการสอน | RMU',
  description: 'ระบบประเมินประสิทธิภาพการสอนของอาจารย์ มหาวิทยาลัยเทคโนโลยีราชมงคล',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getSession()

  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-50 min-h-screen">
        <Navbar user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
