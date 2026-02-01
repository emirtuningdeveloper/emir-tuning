'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore'
import { SiteSettings } from '@/lib/types'
import Logo from '@/components/Logo'

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await getSiteSettings()
      setSiteSettings(settings)
    } catch (error) {
      console.error('Error loading site settings:', error)
    }
  }

  return (
    <footer className="bg-anthracite-900 text-gray-300 border-t border-white/5">
      <div className="container mx-auto px-4 py-14 md:py-16 max-w-content">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand - Logo */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center mb-5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite-900 rounded">
              <div className="h-10 md:h-12 w-auto max-w-[180px] flex items-center opacity-95 hover:opacity-100 transition-opacity duration-200">
                <Logo compact />
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              {siteSettings?.siteDescription || 
                'Otomotiv tuning dünyasında profesyonel çözümler sunuyoruz. Kaliteli ürünler ve uzman hizmetlerimizle araçlarınıza değer katıyoruz.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Hızlı Linkler</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Ana Sayfa' },
                { href: '/urunler', label: 'Ürünler' },
                { href: '/hizmetler', label: 'Hizmetler' },
                { href: '/hakkimizda', label: 'Hakkımızda' },
                { href: '/referanslar', label: 'Referanslar' },
                { href: '/iletisim', label: 'İletişim' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">İletişim</h3>
            <ul className="space-y-3">
              {siteSettings?.contactPhone && (
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span>{siteSettings.contactPhone}</span>
                </li>
              )}
              {siteSettings?.contactEmail && (
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="break-all">{siteSettings.contactEmail}</span>
                </li>
              )}
              {siteSettings?.address && (
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                  <span>{siteSettings.address}</span>
                </li>
              )}
              {!siteSettings?.contactPhone && !siteSettings?.contactEmail && (
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span>İletişim için formu kullanın</span>
                </li>
              )}
              {!siteSettings?.contactEmail && (
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span>info@emirtuning.com</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {siteSettings?.siteName || 'Emir Tuning'}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
