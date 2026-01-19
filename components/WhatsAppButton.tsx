'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const phoneNumber = '+905395109013'
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`

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
