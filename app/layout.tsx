import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Emir Tuning - Otomotiv Tuning Çözümleri',
  description: 'Profesyonel otomotiv tuning ürünleri ve hizmetleri',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-[#0a0a0a]">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
