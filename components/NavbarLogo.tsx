'use client'

import { useEffect, useState, useRef } from 'react'
import { Car } from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore'
import { toDirectDriveImageUrl } from '@/lib/drive-logo-url'

export default function NavbarLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoVersion, setLogoVersion] = useState<number>(() => Date.now())
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    async function loadLogo() {
      try {
        const settings = await getSiteSettings()
        if (!mounted.current) return
        const raw = settings?.logoUrl?.trim() ?? ''
        const url = toDirectDriveImageUrl(raw)
        if (url) {
          console.log('Navbar: Using Firestore logoUrl')
          setLogoUrl(url)
          setLogoVersion(Date.now())
          setLoading(false)
          return
        }
        console.log('Navbar: Using Drive logo fallback')
        const response = await fetch('/api/drive/logo')
        if (!mounted.current) return
        if (!response.ok) {
          throw new Error(`Failed to fetch logo: ${response.status}`)
        }
        const data = await response.json()
        if (!mounted.current) return
        if (data?.found && data?.logo?.publicUrl) {
          setLogoUrl(data.logo.publicUrl)
          setLogoVersion(Date.now())
        }
      } catch (error) {
        if (mounted.current) {
          console.error('Navbar: Error loading logo', error)
        }
      } finally {
        if (mounted.current) setLoading(false)
      }
    }
    loadLogo()
    return () => {
      mounted.current = false
    }
  }, [])

  if (logoUrl && !loading) {
    const proxiedUrl = `/api/carparts/image?url=${encodeURIComponent(logoUrl)}&v=${logoVersion}`
    const directUrl = `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}v=${logoVersion}`

    return (
      <img
        src={proxiedUrl}
        alt="Emir Tuning Logo"
        className="h-14 w-auto object-contain min-h-[2.5rem]"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          if (target.src !== directUrl) {
            target.src = directUrl
          } else {
            setLogoUrl(null)
          }
        }}
      />
    )
  }

  return <Car className="w-12 h-12 text-white" />
}
