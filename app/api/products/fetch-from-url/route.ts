import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export interface FetchFromUrlProduct {
  id: string
  name: string
  imageUrl: string
  productUrl: string
  /** Fiyat varsa metin (örn. "6.749,99 TL") */
  priceText?: string
  /** Fiyat sayısal (varsa) */
  price?: number
}

const BLACKLIST_PHRASES = [
  'alfabetik (a-z)',
  'alfabetik (z-a)',
  'ucuzdan pahalıya',
  'pahalıdan ucuza',
  'en popülerler',
  'tükenenleri gizle',
  'sırala',
  'filtreleri aç',
  'önce yeni eklenenler',
  'önce ilk eklenenler',
  'marka',
  'stok',
  'tümü',
  'stokta yok',
  'stokta var',
  'ara',
  'geri dön',
  'tüm ürünleri göster',
  'body kit (tampon ekleri)',
  'ön tampon ekleri & lipler',
  'arka difüzör & tampon eki',
  'yan marşpiyeller',
  'arka spoyler',
  'ön çamurluklar',
  'ön kaputlar',
  'sepete ekle',
  'yeni ürün',
  'vitrin ürünü',
  'indirimli',
  'popüler ürünler',
  'filtreleri kapat',
  'önce yeni',
  'önce ilk',
  'en az popülerler',
  'a`dan z`ye',
  "z`den a`ya",
]

/** Menü/filtre/sıralama metinlerini eler. */
function isBlacklistedTitle(title: string): boolean {
  const n = title
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
  if (n.length < 3) return true
  for (const phrase of BLACKLIST_PHRASES) {
    if (n === phrase || n.startsWith(phrase + ' ') || n.endsWith(' ' + phrase) || n.includes(' ' + phrase + ' ')) return true
    if (phrase.length >= 10 && n.includes(phrase)) return true
  }
  return false
}

/** Container metninden TL fiyatı bulur (6.749,99 TL veya 6749,99TL). */
function extractPriceText(text: string): string | null {
  const match = text.match(/[\d.,]+\s*TL|[\d.,]+\s*₺/i)
  return match ? match[0].trim() : null
}

/** Fiyat metnini sayıya çevirir (virgül ondalık ayracı). */
function parsePrice(priceText: string): number | undefined {
  const cleaned = priceText.replace(/\s*TL\s*$/i, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : undefined
}

/** Gerçek ürün görseli mi (placeholder/icon değil). FK Tuning: imager.php?f=resimler/urunler/.../xxx.jpeg */
function isProductImage(src: string): boolean {
  const s = (src || '').toLowerCase()
  if (!s || s.startsWith('data:image/svg') || s.includes('placeholder') || s.includes('loading') || s.includes('1x1') || s.includes('blank') || s.includes('icon') || s.includes('badge') || s.includes('logo')) return false
  if (s.includes('data:image')) return true
  if (/\.(jpg|jpeg|png|webp|gif)(\?|$|&|%)/i.test(s)) return true
  if (s.includes('/uploads/') || s.includes('/images/') || s.includes('product')) return true
  if (s.includes('imager.php') && (s.includes('urunler') || s.includes('resimler') || s.includes('.jpeg') || s.includes('.jpg') || s.includes('.png'))) return true
  return false
}

/** Verilen URL'den ürünleri çeker. Sadece görseli + ismi (ve varsa fiyatı) olan gerçek ürün kartlarını döndürür. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawUrl = searchParams.get('url') || ''
    const url = (rawUrl || '').trim()
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir URL girin (http veya https).', products: [] },
        { status: 400 }
      )
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Sayfa alınamadı: ${response.status}`, products: [] },
        { status: 200 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const baseUrl = new URL(url)
    const origin = baseUrl.origin
    const products: FetchFromUrlProduct[] = []
    const seenUrls = new Set<string>()

    function toAbsolute(href: string): string {
      const h = (href || '').trim()
      if (!h || h === '#' || h.startsWith('javascript:')) return ''
      if (h.startsWith('http://') || h.startsWith('https://')) return h
      if (h.startsWith('//')) return `${baseUrl.protocol}${h}`
      if (h.startsWith('/')) return `${origin}${h}`
      return `${origin}/${h}`
    }

    function addProduct(
      fullUrl: string,
      name: string,
      imageUrl: string,
      priceText?: string | null,
      priceNum?: number
    ) {
      if (!fullUrl || seenUrls.has(fullUrl)) return
      const n = name.trim().replace(/\s+/g, ' ')
      if (n.length < 10) return
      if (isBlacklistedTitle(n)) return
      seenUrls.add(fullUrl)
      const slug = fullUrl.replace(/.*\/([^/]+)\/?(\?.*)?$/, '$1') || `p-${products.length}`
      const id = `ext_${slug.replace(/[^a-z0-9-_]/gi, '_').slice(0, 80)}`
      products.push({
        id,
        name: n,
        imageUrl: imageUrl ? toAbsolute(imageUrl) : '',
        productUrl: fullUrl,
        ...(priceText && { priceText }),
        ...(priceNum != null && Number.isFinite(priceNum) && { price: priceNum }),
      })
    }

    // Ürün kartı container'ları: görsel + link + (fiyat veya uzun başlık) zorunlu
    const containerSelectors = [
      '[class*="product-item"]',
      '[class*="productItem"]',
      '.product-box',
      '[class*="product-box"]',
      '.product-card',
      '[class*="product-card"]',
      '.product',
      '.item.product',
      'article.product',
      '[class*="product-list"] .item',
      '.product-list-item',
      '[data-product]',
      '[class*="urun"]',
    ]

    for (const sel of containerSelectors) {
      $(sel).each((_, el) => {
        const $c = $(el)
        const currentPath = baseUrl.pathname.replace(/\/$/, '')
        const $a = $c.find('a[href]').filter((_, a) => {
          const href = $(a).attr('href') || ''
          const abs = toAbsolute(href)
          if (!abs || abs === url) return false
          if (abs.endsWith('#') || (abs.includes('#') && abs.split('#')[0].replace(/\/$/, '') === url.replace(/\/$/, ''))) return false
          try {
            const linkPath = new URL(abs).pathname.replace(/\/$/, '')
            if (linkPath === currentPath) return false
          } catch { return false }
          return !/\/kategori\/|\/category\/?$/i.test(abs)
        }).first()
        const href = $a.attr('href')
        if (!href) return
        const fullUrl = toAbsolute(href)
        if (!fullUrl) return

        const $img = $c.find('img').filter((_, img) => {
          const src =
            $(img).attr('data-src') ||
            $(img).attr('data-original') ||
            $(img).attr('data-srcset')?.split(',')[0]?.trim().split(/\s+/)[0] ||
            $(img).attr('src') ||
            ''
          return isProductImage(src)
        }).first()
        const imgSrc =
          $img.attr('data-src') ||
          $img.attr('data-original') ||
          $img.attr('data-srcset')?.split(',')[0]?.trim().split(/\s+/)[0] ||
          $img.attr('src') ||
          ''
        if (!imgSrc || !isProductImage(imgSrc)) return

        const containerText = $c.text()
        const priceText = extractPriceText(containerText)
        const priceNum = priceText ? parsePrice(priceText) : undefined

        const name =
          $a.attr('title')?.trim() ||
          $a.find('[class*="title"], [class*="name"], .product-title, h2, h3, h4').first().text().trim() ||
          $a.find('span').filter((_, s) => $(s).text().trim().length > 15).first().text().trim() ||
          $a.text().trim()
        if (!name || name.length < 10) return
        const cleanName = name.replace(/\s+/g, ' ').trim()
        if (cleanName.length < 10) return
        if (isBlacklistedTitle(cleanName)) return
        addProduct(fullUrl, cleanName, imgSrc, priceText, priceNum)
      })
      if (products.length > 0) break
    }

    // Fallback: sayfadaki tüm link+img+price içeren blokları tara (FK Tuning vb.)
    if (products.length === 0) {
      const candidates: { url: string; name: string; img: string; priceText: string | null; priceNum: number | undefined }[] = []
      $('a[href]').each((_, el) => {
        const $a = $(el)
        const href = $a.attr('href') || ''
        const fullUrl = toAbsolute(href)
        if (!fullUrl || fullUrl === url || fullUrl.endsWith('#')) return
        try {
          const linkPath = new URL(fullUrl).pathname.replace(/\/$/, '')
          if (linkPath === baseUrl.pathname.replace(/\/$/, '')) return
        } catch { return }
        let $block = $a.parent()
        while ($block.length && $block.get(0)?.tagName !== 'BODY') {
          const blockText = $block.text()
          const pt = extractPriceText(blockText)
          const hasPrice = !!(pt && parsePrice(pt))
          const $firstImg = $block.find('img').filter((_, i) => {
            const imgEl = $(i)
            const src = imgEl.attr('data-src') || imgEl.attr('data-original') || imgEl.attr('src') || ''
            return isProductImage(src)
          }).first()
          const hasImg = $firstImg.length > 0
          if (hasPrice && hasImg) break
          $block = $block.parent()
        }
        if (!$block.length) return
        const blockText = $block.text()
        const priceText = extractPriceText(blockText)
        const priceNum = priceText ? parsePrice(priceText) : undefined
        if (!priceNum && !priceText) return
        const $img = $block.find('img').filter((_, i) => {
          const imgEl = $(i)
          const src = imgEl.attr('data-src') || imgEl.attr('data-original') || imgEl.attr('src') || ''
          return isProductImage(src)
        }).first()
        const imgSrc =
          $img.attr('data-src') ||
          $img.attr('data-original') ||
          $img.attr('src') ||
          ''
        if (!imgSrc) return
        let name =
          $a.attr('title')?.trim() ||
          $a.find('[class*="title"], [class*="name"]').first().text().trim() ||
          $a.text().trim()
        name = (name || '').replace(/\s+/g, ' ').trim()
        if (name.length < 10) return
        if (isBlacklistedTitle(name)) return
        candidates.push({ url: fullUrl, name, img: imgSrc, priceText, priceNum })
      })
      const seen = new Set<string>()
      for (const c of candidates) {
        if (seen.has(c.url)) continue
        seen.add(c.url)
        addProduct(c.url, c.name, c.img, c.priceText, c.priceNum)
      }
    }

    // Son fallback: görsel + uzun başlık (fiyat zorunlu değil ama başlık uzun olsun)
    if (products.length === 0) {
      $('a[href]').each((_, el) => {
        const $a = $(el)
        const href = $a.attr('href') || ''
        const fullUrl = toAbsolute(href)
        if (!fullUrl || fullUrl === url) return
        const $container = $a.closest('div[class], li[class], article[class]')
        const $block = $container.length ? $container : $a.parent()
        const $img = $block.find('img').first()
        const imgSrc =
          $img.attr('data-src') ||
          $img.attr('data-original') ||
          $img.attr('src') ||
          ''
        if (!imgSrc || !isProductImage(imgSrc)) return
        let name =
          $a.attr('title')?.trim() ||
          $a.find('[class*="title"], [class*="name"], h2, h3').first().text().trim() ||
          $a.text().trim()
        name = (name || '').replace(/\s+/g, ' ').trim()
        if (name.length < 25) return
        if (isBlacklistedTitle(name)) return
        const priceText = extractPriceText($block.text())
        const priceNum = priceText ? parsePrice(priceText) : undefined
        addProduct(fullUrl, name, imgSrc, priceText, priceNum)
      })
    }

    const unique = products.filter(
      (p, i) => products.findIndex((q) => q.productUrl === p.productUrl) === i
    )

    return NextResponse.json({
      success: true,
      products: unique.slice(0, 200),
      totalCount: unique.length,
    })
  } catch (err) {
    console.error('fetch-from-url error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Ürünler çekilemedi',
        products: [],
      },
      { status: 200 }
    )
  }
}
