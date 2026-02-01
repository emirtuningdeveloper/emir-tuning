'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface BrandLogoItem {
  id: string
  name: string
  publicUrl: string
}

/** Modül seviyesi önbellek: yeniden mount'ta görseller kaybolmasın */
let cachedBrandLogos: BrandLogoItem[] = []

/** Tek logo: yüklenmezse birkaç kez yeniden dener */
function LogoImage({
  item,
  urlVersion,
  alt,
}: {
  item: BrandLogoItem
  urlVersion: number
  alt: string
}) {
  const [retry, setRetry] = useState(0)
  const baseUrl = `${item.publicUrl}${item.publicUrl.includes('?') ? '&' : '?'}v=${urlVersion}`
  const src = retry > 0 ? `${baseUrl}&r=${retry}` : baseUrl

  const handleError = () => {
    if (retry < 2) setRetry((r) => r + 1)
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-32 md:h-40 w-auto max-w-full object-contain"
      loading="eager"
      onError={handleError}
    />
  )
}

/** px per second – yavaş sürekli akış */
const SCROLL_SPEED = 28

/** Sanitize file name for alt: remove extension, replace _ and - with space */
function altFromName(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim() || 'Brand logo'
}

/** Görünen logo sayısı – logolar 3x büyük (az slot, geniş kart) */
function getVisibleCount(): number {
  if (typeof window === 'undefined') return 2
  if (window.matchMedia('(min-width: 1280px)').matches) return 3
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 768px)').matches) return 2
  if (window.matchMedia('(min-width: 640px)').matches) return 2
  return 1
}

export default function BrandLogoCarousel() {
  const [logos, setLogos] = useState<BrandLogoItem[]>(() => cachedBrandLogos)
  const [loading, setLoading] = useState(() => cachedBrandLogos.length === 0)
  const [apiError, setApiError] = useState<string | null>(null)
  const [itemWidth, setItemWidth] = useState(200)
  const [paused, setPaused] = useState(false)
  const [urlVersion] = useState(() => Date.now())
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const segmentWidthRef = useRef(0)
  const rafRef = useRef<number>(0)
  const isButtonAnimatingRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (cachedBrandLogos.length > 0) {
      setLogos(cachedBrandLogos)
      setLoading(false)
    }
    fetch('/api/drive/brands')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setApiError(data?.error || `HTTP ${res.status}`)
          return { ...data, images: [] }
        }
        setApiError(null)
        return data
      })
      .then((data) => {
        const list = Array.isArray(data.images) ? data.images : []
        if (list.length > 0) {
          cachedBrandLogos = list
          setLogos(list)
        }
      })
      .catch((err) => {
        console.error('Brand logos fetch failed:', err)
        setApiError(err?.message || 'Bağlantı hatası')
        if (cachedBrandLogos.length === 0) setLogos([])
      })
      .finally(() => setLoading(false))
  }, [])

  const measureWidth = useCallback(() => {
    if (!containerRef.current || logos.length === 0) return
    const containerWidth = containerRef.current.getBoundingClientRect().width
    const visible = getVisibleCount()
    if (containerWidth > 0 && visible > 0) setItemWidth(containerWidth / visible)
  }, [logos.length])

  useEffect(() => {
    if (logos.length === 0) return
    measureWidth()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(measureWidth)
    ro.observe(el)
    const onResize = () => measureWidth()
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [logos.length, measureWidth])

  useEffect(() => {
    if (logos.length === 0) return
    segmentWidthRef.current = logos.length * itemWidth
  }, [logos.length, itemWidth])

  useEffect(() => {
    const track = trackRef.current
    if (!track || logos.length === 0) return
    let last = performance.now()
    function tick(now: number) {
      if (!track) return
      const dt = (now - last) / 1000
      last = now
      if (!paused && !isButtonAnimatingRef.current && segmentWidthRef.current > 0) {
        offsetRef.current += SCROLL_SPEED * dt
        const seg = segmentWidthRef.current
        while (offsetRef.current >= seg) offsetRef.current -= seg
        track.style.transform = `translateX(-${offsetRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [logos.length, paused])

  const ANIM_MS = 600

  const goPrev = () => {
    const track = trackRef.current
    if (logos.length === 0 || !track || isButtonAnimatingRef.current) return
    isButtonAnimatingRef.current = true
    const seg = logos.length * itemWidth
    const target = (offsetRef.current - itemWidth + seg) % seg
    track.style.transition = `transform ${ANIM_MS}ms ease-out`
    track.style.transform = `translateX(-${target}px)`
    setTimeout(() => {
      if (!trackRef.current) return
      offsetRef.current = target
      trackRef.current.style.transition = ''
      isButtonAnimatingRef.current = false
    }, ANIM_MS)
  }
  const goNext = () => {
    const track = trackRef.current
    if (logos.length === 0 || !track || isButtonAnimatingRef.current) return
    isButtonAnimatingRef.current = true
    const seg = logos.length * itemWidth
    const target = (offsetRef.current + itemWidth) % seg
    track.style.transition = `transform ${ANIM_MS}ms ease-out`
    track.style.transform = `translateX(-${target}px)`
    setTimeout(() => {
      if (!trackRef.current) return
      offsetRef.current = target
      trackRef.current.style.transition = ''
      isButtonAnimatingRef.current = false
    }, ANIM_MS)
  }

  if (loading) {
    return (
      <div className="w-full max-w-content mx-auto py-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-anthracite-300 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (logos.length === 0) {
    return (
      <div className="w-full max-w-content mx-auto py-10 px-6 text-center">
        <p className="text-anthracite-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          {apiError ? (
            <>
              Marka logoları yüklenemedi:{' '}
              <span className="text-red-600 font-medium">{apiError}</span>
              <br />
              <span className="text-anthracite-500 text-xs mt-2 block">
                Vercel env değişkenlerini kontrol edin. GOOGLE_PRIVATE_KEY formatı özellikle önemli (tek satır, \\n ile).
              </span>
            </>
          ) : (
            <>
              Marka logoları burada görünecek.{' '}
              <span className="text-anthracite-500">
                <code className="bg-white/80 px-1.5 py-0.5 rounded text-xs">GOOGLE_DRIVE_BRANDS_FOLDER_ID</code> değerini ekleyin.
              </span>
            </>
          )}
        </p>
      </div>
    )
  }

  const duplicated = [...logos, ...logos]

  return (
    <div
      className="relative w-full max-w-content mx-auto overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={containerRef} className="overflow-hidden">
        <div ref={trackRef} className="flex will-change-transform">
          {duplicated.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="flex-shrink-0 flex items-center justify-center px-4 sm:px-6"
              style={{ width: `${itemWidth}px` }}
            >
              <LogoImage
                item={item}
                urlVersion={urlVersion}
                alt={altFromName(item.name)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={goPrev}
          className="w-9 h-9 rounded-full border border-anthracite-200 bg-white flex items-center justify-center text-anthracite-600 hover:bg-anthracite-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Önceki markalar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="w-9 h-9 rounded-full border border-anthracite-200 bg-white flex items-center justify-center text-anthracite-600 hover:bg-anthracite-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Sonraki markalar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
