/**
 * Harici görsel URL'lerini kendi domain'imiz üzerinden sunan proxy URL'ine çevirir.
 * Tarayıcıda img src sadece sitemizin adresi görünür, orijinal site gizlenir.
 */
export function getProxiedImageUrl(originalUrl: string | undefined): string {
  if (!originalUrl || typeof originalUrl !== 'string') return ''

  const trimmed = originalUrl.trim()
  if (!trimmed) return ''

  // Zaten kendi proxy URL'imiz ise aynen dön
  if (
    trimmed.startsWith('/api/image?') ||
    trimmed.includes('/api/image?url=') ||
    trimmed.startsWith('/api/carparts/image?')
  ) {
    return trimmed
  }

  // Sitedeki relative path'ler (örn. /logo.png) proxy'lenmez
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed

  // Aynı origin (kendi domain) ise proxy'ye gerek yok (client'ta)
  try {
    if (typeof window !== 'undefined') {
      const u = new URL(trimmed, window.location.origin)
      if (u.origin === window.location.origin) return trimmed
    }
  } catch {
    // URL parse hatası; harici kabul edip proxy'le
  }

  return `/api/image?url=${encodeURIComponent(trimmed)}`
}
