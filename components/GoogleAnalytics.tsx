'use client'

import { useEffect, useState } from 'react'
import { getSiteSettings } from '@/lib/firestore'

/**
 * Google Analytics 4 - Site ayarlarından Measurement ID alır ve gtag script yükler.
 * Admin panelinden girilen G-XXXXXXXXXX değeri Firestore'da seoSettings.googleAnalyticsId'de tutulur.
 */
export default function GoogleAnalytics() {
  const [measurementId, setMeasurementId] = useState<string | null>(null)

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        const id = s?.seoSettings?.googleAnalyticsId?.trim()
        if (id && /^G-[A-Z0-9]+$/i.test(id)) {
          setMeasurementId(id)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)) return

    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `
    document.head.appendChild(script2)
  }, [measurementId])

  return null
}
