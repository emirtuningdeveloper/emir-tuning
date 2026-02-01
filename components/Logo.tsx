'use client'

import { useEffect, useState, useRef } from 'react'
import { Car } from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore'
import { toDirectDriveImageUrl } from '@/lib/drive-logo-url'

interface LogoProps {
  /** Compact mode for footer/navbar: preserves aspect ratio, no min height */
  compact?: boolean
}

export default function Logo({ compact = false }: LogoProps) {
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
          setLogoUrl(url)
          setLogoVersion(Date.now())
          setLoading(false)
          return
        }
        const response = await fetch('/api/drive/logo')
        if (!mounted.current) return
        if (!response.ok) throw new Error(`Failed to fetch logo: ${response.status}`)
        const data = await response.json()
        if (!mounted.current) return
        if (data?.found && data?.logo?.publicUrl) {
          setLogoUrl(data.logo.publicUrl)
          setLogoVersion(Date.now())
        }
      } catch (error) {
        if (mounted.current) console.error('Error loading logo:', error)
      } finally {
        if (mounted.current) setLoading(false)
      }
    }
    loadLogo()
    return () => { mounted.current = false }
  }, [])

  if (loading) {
    return (
      <div className={`relative ${compact ? 'h-full min-w-[80px]' : 'w-full'}`}>
        <div className={`relative overflow-hidden bg-gray-100 animate-pulse ${compact ? 'h-full w-full max-h-12 rounded-lg object-contain' : 'rounded-2xl h-32 md:h-40 lg:h-48'}`} />
      </div>
    )
  }

  if (!logoUrl) {
    return (
      <div className={`relative ${compact ? 'h-full min-w-[80px]' : 'w-full'}`}>
        <div className={`relative overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center rounded-2xl ${compact ? 'h-full w-full max-h-12' : 'h-32 md:h-40 lg:h-48'}`}>
          <Car className={compact ? 'w-8 h-8 text-primary-600' : 'w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-primary-600'} />
        </div>
      </div>
    )
  }

  const proxiedUrl = `/api/carparts/image?url=${encodeURIComponent(logoUrl)}&v=${logoVersion}`
  const directUrl = `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}v=${logoVersion}`

  return (
    <div className={`relative ${compact ? 'h-full w-auto flex items-center' : 'w-full'}`}>
      <div className={`relative overflow-hidden ${compact ? 'h-full w-full max-h-12 flex items-center' : 'rounded-2xl'}`}>
        <img
          src={proxiedUrl}
          alt="Emir Tuning Logo"
          className={`rounded-2xl block ${compact ? 'max-h-full w-auto object-contain' : 'w-full h-auto'}`}
          style={compact ? { maxHeight: '48px', width: 'auto', objectFit: 'contain' } : { minHeight: '200px', backgroundColor: 'transparent', display: 'block' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (target.src !== directUrl) {
              target.src = directUrl
            } else {
              target.style.display = 'none'
              target.parentElement?.querySelector('.logo-placeholder') &&
                ((target.parentElement.querySelector('.logo-placeholder') as HTMLElement).style.display = 'flex')
            }
          }}
        />
        <div className="logo-placeholder hidden absolute inset-0 w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center rounded-2xl">
          <Car className={compact ? 'w-8 h-8 text-primary-600' : 'w-24 h-24 text-primary-600'} />
        </div>
      </div>
    </div>
  )
}
