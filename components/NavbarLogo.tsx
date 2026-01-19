'use client'

import { useEffect, useState } from 'react'
import { Car } from 'lucide-react'

export default function NavbarLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogo() {
      try {
        console.log('Navbar: Fetching logo from Drive API...')
        const response = await fetch('/api/drive/logo')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch logo: ${response.status}`)
        }

        const data = await response.json()
        console.log('Navbar: Logo API response:', data)
        
        if (data.found && data.logo && data.logo.publicUrl) {
          console.log('Navbar: Setting logo URL:', data.logo.publicUrl)
          setLogoUrl(data.logo.publicUrl)
        } else {
          console.warn('Navbar: Logo not found')
        }
      } catch (error) {
        console.error('Navbar: Error fetching logo from Drive:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [])

  if (logoUrl && !loading) {
    // Proxy URL kullan (CORS sorunlarını önlemek için)
    const proxiedUrl = `/api/carparts/image?url=${encodeURIComponent(logoUrl)}`
    
    return (
      <img
        src={proxiedUrl}
        alt="Emir Tuning Logo"
        className="h-10 w-auto object-contain"
        onError={(e) => {
          // Eğer proxy çalışmazsa direkt URL'i dene
          const target = e.target as HTMLImageElement
          if (target.src !== logoUrl) {
            console.log('Trying direct URL for navbar logo')
            target.src = logoUrl
          } else {
            console.error('Both proxy and direct URL failed for navbar logo')
            setLogoUrl(null)
          }
        }}
        onLoad={() => {
          console.log('Navbar logo loaded successfully')
        }}
      />
    )
  }

  // Fallback: Car icon
  return <Car className="w-8 h-8" />
}
