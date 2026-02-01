'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore'

const DEFAULT_PHONE = '+905395109013'

export default function WhatsAppButton() {
  const [phone, setPhone] = useState<string | null>(null)

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        const raw = (s?.whatsappPhone || s?.contactPhone || DEFAULT_PHONE || '').trim()
        setPhone(raw || DEFAULT_PHONE)
      })
      .catch(() => setPhone(DEFAULT_PHONE))
  }, [])

  if (!phone) return null

  const digits = phone.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${digits}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        WhatsApp ile iletişime geç
      </span>
    </a>
  )
}
