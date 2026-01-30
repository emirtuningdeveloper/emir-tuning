import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getDrstuningCategoryUrl } from '@/lib/drstuning'

export interface ByCategoryProduct {
  id: string
  name: string
  imageUrl: string
  productUrl?: string
}

const DRS_BASE = 'https://www.drstuning.com'

/** Gerçek ürün görseli: myassets/products/ ve _min veya /products/xxx/ ile biten */
function isProductImageSrc(src: string): boolean {
  const s = (src || '').trim().toLowerCase()
  if (!s || s.startsWith('data:') || s.includes('placeholder') || s.includes('loading') || s.includes('1x1') || s.includes('blank') || s.includes('icon') || s.includes('badge') || s.includes('logo')) return false
  const hasProductsPath = s.includes('myassets/products') || (s.includes('/idea/') && s.includes('/products/'))
  const hasImageExt = s.includes('.jpg') || s.includes('.jpeg') || s.includes('.png') || s.includes('.webp')
  return !!hasProductsPath && !!hasImageExt
}

/** Öncelik: myassets/products + _min (liste thumbnail), sonra myassets/products + .jpg */
function scoreProductImageSrc(src: string): number {
  const s = (src || '').toLowerCase()
  if (!isProductImageSrc(src)) return 0
  if (s.includes('myassets/products') && s.includes('_min')) return 10
  if (s.includes('myassets/products')) return 5
  if (s.includes('/idea/') && s.includes('/products/')) return 3
  return 1
}

function toAbsoluteImageUrl(url: string): string {
  const u = (url || '').trim()
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  if (u.startsWith('//')) return `https:${u}`
  return `${DRS_BASE}${u.startsWith('/') ? '' : '/'}${u}`
}

function pickProductImageUrl($imgs: cheerio.Cheerio<cheerio.Element>): string {
  const candidates: { url: string; score: number }[] = []
  const attrs = ['data-src', 'data-original', 'data-lazy-src', 'data-zoom-image', 'data-srcset', 'src']

  for (let i = 0; i < $imgs.length; i++) {
    const $img = $imgs.eq(i)
    for (const attr of attrs) {
      let val = $img.attr(attr) || ''
      if (attr === 'data-srcset') {
        const first = val.split(',')[0]?.trim().split(/\s+/)[0] || ''
        val = first
      }
      if (!val) continue
      const url = toAbsoluteImageUrl(val)
      if (!url) continue
      const score = scoreProductImageSrc(url)
      if (score > 0) candidates.push({ url, score })
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score)
    return candidates[0].url
  }

  for (let i = 0; i < $imgs.length; i++) {
    const url = toAbsoluteImageUrl($imgs.eq(i).attr('src') || $imgs.eq(i).attr('data-src') || '')
    if (url && (url.includes('myassets') || url.includes('/products/'))) return url
  }
  return ''
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryPath = searchParams.get('categoryPath') || 'body-kit-setler'
    const page = Math.max(1, parseInt(searchParams.get('page') || searchParams.get('tp') || '1', 10))

    const url = getDrstuningCategoryUrl(categoryPath, page)
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        Referer: 'https://www.drstuning.com/',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `DRS sayfası alınamadı: ${response.status}` },
        { status: 200 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const products: ByCategoryProduct[] = []
    const seenUrls = new Set<string>()

    // Önce ürün kartı container'larını dene (Ideasoft: .product, .product-item vb.)
    const containers = $('.product, .product-item, [class*="product-box"], [class*="productItem"]')
    if (containers.length > 0) {
      containers.each((_, container) => {
        const $c = $(container)
        const $a = $c.find('a[href*="/urun/"]').first()
        const href = $a.attr('href') || ''
        if (!href) return
        const fullUrl = href.startsWith('http') ? href : `https://www.drstuning.com${href.startsWith('/') ? '' : '/'}${href}`
        if (seenUrls.has(fullUrl)) return
        seenUrls.add(fullUrl)

        const name = ($a.attr('title') || $a.text()).trim()
        if (!name || name.length < 3) return

        let imageUrl = pickProductImageUrl($c.find('img'))
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://www.drstuning.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
        }
        // Sadece gerçek ürün görseli olanları ekle (Yeni Ürünler / En Popüler gibi resimsiz blokları atla)
        if (!imageUrl || !isProductImageSrc(imageUrl)) return

        const slug = fullUrl.replace(/.*\/urun\//, '').replace(/\/$/, '') || `p-${products.length}`
        products.push({ id: `drstuning_${slug}`, name, imageUrl, productUrl: fullUrl })
      })
    }

    // Container yoksa tüm /urun/ linklerini tara
    if (products.length === 0) {
      $('a[href*="/urun/"]').each((_, el) => {
        const $a = $(el)
        const href = $a.attr('href') || ''
        const fullUrl = href.startsWith('http') ? href : `https://www.drstuning.com${href.startsWith('/') ? '' : '/'}${href}`
        if (seenUrls.has(fullUrl)) return
        seenUrls.add(fullUrl)

        const name = ($a.attr('title') || $a.text()).trim()
        if (!name || name.length < 3) return

        const $container = $a.closest('[class*="product"], .item, tr, li')
        const $imgs = $container.length ? $container.find('img') : $a.find('img')
        let imageUrl = pickProductImageUrl($imgs)
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://www.drstuning.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
        }
        if (!imageUrl || !isProductImageSrc(imageUrl)) return

        const slug = fullUrl.replace(/.*\/urun\//, '').replace(/\/$/, '') || `p-${products.length}`
        products.push({ id: `drstuning_${slug}`, name, imageUrl, productUrl: fullUrl })
      })
    }

    const unique = products.filter((p, i) => products.findIndex((q) => q.productUrl === p.productUrl) === i)
    const pageProducts = unique.slice(0, 100)

    const allPages = searchParams.get('allPages') === 'true'
    if (!allPages) {
      return NextResponse.json({
        success: true,
        products: pageProducts,
        totalCount: pageProducts.length,
        source: 'DRS Tuning',
      })
    }

    // Tüm sayfalardan çek: sayfa sayfa dene, ürün gelmeyene kadar (ilk sayfa sınırı yok)
    const allProducts: ByCategoryProduct[] = [...unique]
    // seenUrls zaten ilk sayfa ile dolu, döngüde aynı Set kullanılacak
    let currentPage = page
    const maxPages = 100

    while (currentPage < maxPages) {
      currentPage += 1
      const nextUrl = getDrstuningCategoryUrl(categoryPath, currentPage)
      const nextRes = await fetch(nextUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          Referer: 'https://www.drstuning.com/',
        },
        cache: 'no-store',
      })
      if (!nextRes.ok) break
      const nextHtml = await nextRes.text()
      const $next = cheerio.load(nextHtml)
      const nextProducts: ByCategoryProduct[] = []
      const containers = $next('.product, .product-item, [class*="product-box"], [class*="productItem"]')
      if (containers.length > 0) {
        containers.each((_, container) => {
          const $c = $next(container)
          const $a = $c.find('a[href*="/urun/"]').first()
          const href = $a.attr('href') || ''
          if (!href) return
          const fullUrl = href.startsWith('http') ? href : `https://www.drstuning.com${href.startsWith('/') ? '' : '/'}${href}`
          if (seenUrls.has(fullUrl)) return
          seenUrls.add(fullUrl)
          const name = ($a.attr('title') || $a.text()).trim()
          if (!name || name.length < 3) return
          let imageUrl = pickProductImageUrl($c.find('img'))
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://www.drstuning.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
          }
          if (!imageUrl || !isProductImageSrc(imageUrl)) return
          const slug = fullUrl.replace(/.*\/urun\//, '').replace(/\/$/, '') || `p-${nextProducts.length}`
          nextProducts.push({ id: `drstuning_${slug}`, name, imageUrl, productUrl: fullUrl })
        })
      }
      if (nextProducts.length === 0) {
        $next('a[href*="/urun/"]').each((_, el) => {
          const $a = $next(el)
          const href = $a.attr('href') || ''
          const fullUrl = href.startsWith('http') ? href : `https://www.drstuning.com${href.startsWith('/') ? '' : '/'}${href}`
          if (seenUrls.has(fullUrl)) return
          seenUrls.add(fullUrl)
          const name = ($a.attr('title') || $a.text()).trim()
          if (!name || name.length < 3) return
          const $container = $a.closest('[class*="product"], .item, tr, li')
          const $imgs = $container.length ? $container.find('img') : $a.find('img')
          let imageUrl = pickProductImageUrl($imgs)
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://www.drstuning.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
          }
          if (!imageUrl || !isProductImageSrc(imageUrl)) return
          const slug = fullUrl.replace(/.*\/urun\//, '').replace(/\/$/, '') || `p-${nextProducts.length}`
          nextProducts.push({ id: `drstuning_${slug}`, name, imageUrl, productUrl: fullUrl })
        })
      }
      const nextUnique = nextProducts.filter((p, i) => nextProducts.findIndex((q) => q.productUrl === p.productUrl) === i)
      if (nextUnique.length === 0) break
      allProducts.push(...nextUnique)
    }

    return NextResponse.json({
      success: true,
      products: allProducts,
      totalCount: allProducts.length,
      source: 'DRS Tuning',
    })
  } catch (err: unknown) {
    console.error('by-category error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Ürünler alınamadı',
        products: [],
        totalCount: 0,
      },
      { status: 200 }
    )
  }
}
