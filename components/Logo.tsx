'use client'

import { useEffect, useState } from 'react'
import { Car } from 'lucide-react'

export default function Logo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogo() {
      try {
        console.log('Fetching logo from Drive API...')
        const response = await fetch('/api/drive/logo')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch logo: ${response.status}`)
        }

        const data = await response.json()
        console.log('Logo API response:', data)
        
        if (data.found && data.logo && data.logo.publicUrl) {
          console.log('Setting logo URL:', data.logo.publicUrl)
          setLogoUrl(data.logo.publicUrl)
        } else {
          console.warn('Logo not found. All images:', data.allImages)
        }
      } catch (error) {
        console.error('Error fetching logo from Drive:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [])

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 animate-pulse h-32 md:h-40 lg:h-48"></div>
      </div>
    )
  }

  if (!logoUrl) {
    return (
      <div className="relative w-full">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center h-32 md:h-40 lg:h-48">
          <Car className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-primary-600" />
        </div>
      </div>
    )
  }

  // Proxy URL kullan (CORS sorunlarını önlemek için)
  const proxiedUrl = logoUrl ? `/api/carparts/image?url=${encodeURIComponent(logoUrl)}` : null

  return (
    <div className="relative w-full">
      {/* Logo Container with rounded corners */}
      <div className="relative rounded-2xl overflow-hidden">
        {proxiedUrl ? (
          <img
            src={proxiedUrl}
            alt="Emir Tuning Logo"
            className="w-full h-auto rounded-2xl block"
            style={{ 
              minHeight: '200px',
              backgroundColor: 'transparent',
              display: 'block'
            }}
            onError={(e) => {
              // Eğer proxy de çalışmazsa direkt URL'i dene
              console.error('Logo image failed to load via proxy, trying direct URL:', logoUrl)
              const target = e.target as HTMLImageElement
              const currentSrc = target.src
              if (!currentSrc.includes(logoUrl || '')) {
                console.log('Switching to direct URL')
                target.src = logoUrl || ''
              } else {
                console.error('Both proxy and direct URL failed')
                target.style.display = 'none'
                const placeholder = target.parentElement?.querySelector('.logo-placeholder')
                if (placeholder) {
                  (placeholder as HTMLElement).style.display = 'flex'
                }
              }
            }}
            onLoad={() => {
              console.log('Logo image loaded successfully')
            }}
          />
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center h-32 md:h-40 lg:h-48">
            <Car className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-primary-600" />
          </div>
        )}
        {/* Placeholder - logo bulunamazsa gösterilecek */}
        <div className="logo-placeholder hidden absolute inset-0 w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center rounded-2xl">
          <Car className="w-24 h-24 text-primary-600" />
        </div>
      </div>
    </div>
  )
}
