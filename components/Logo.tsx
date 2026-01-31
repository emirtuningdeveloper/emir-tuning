'use client'

import { useEffect, useState, useRef } from 'react'
import { Car } from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore'
import { toDirectDriveImageUrl } from '@/lib/drive-logo-url'

export default function Logo() {
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

  const proxiedUrl = `/api/carparts/image?url=${encodeURIComponent(logoUrl)}&v=${logoVersion}`
  const directUrl = `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}v=${logoVersion}`

  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={proxiedUrl}
          alt="Emir Tuning Logo"
          className="w-full h-auto rounded-2xl block"
          style={{ minHeight: '200px', backgroundColor: 'transparent', display: 'block' }}
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
          <Car className="w-24 h-24 text-primary-600" />
        </div>
      </div>
    </div>
  )
}
