'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Car, Mail, Phone, MapPin } from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore'
import { SiteSettings } from '@/lib/types'

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
    <footer className="bg-anthracite-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white mb-4">
              <Car className="w-6 h-6" />
              <span className="text-xl font-bold">
                {siteSettings?.siteName || 'Emir Tuning'}
              </span>
            </Link>
            <p className="text-gray-400 mb-4">
              {siteSettings?.siteDescription || 
                'Otomotiv tuning dünyasında profesyonel çözümler sunuyoruz. Kaliteli ürünler ve uzman hizmetlerimizle araçlarınıza değer katıyoruz.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/urunler" className="hover:text-white transition-colors">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="hover:text-white transition-colors">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/referanslar" className="hover:text-white transition-colors">
                  Referanslar
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3">
              {siteSettings?.contactPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{siteSettings.contactPhone}</span>
                </li>
              )}
              {siteSettings?.contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{siteSettings.contactEmail}</span>
                </li>
              )}
              {siteSettings?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="text-sm">{siteSettings.address}</span>
                </li>
              )}
              {!siteSettings?.contactPhone && !siteSettings?.contactEmail && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">İletişim için formu kullanın</span>
                </li>
              )}
              {!siteSettings?.contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">info@emirtuning.com</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-anthracite-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {siteSettings?.siteName || 'Emir Tuning'}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
