import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export interface CarPartsProduct {
  id: string
  name: string
  description: string
  imageUrl: string
  price?: string
  productUrl: string
  category: string
}

/**
 * Ürün adını işle: Ürün kodlarını kaldır, "Aero Body Kit" ve "Carbon Look" kelimelerini koru, diğerlerini Türkçe'ye çevir
 */
function processProductName(name: string): string {
  // Ürün kodunu kaldır (örn: "- CBB..." veya " - CBB...")
  let processed = name.replace(/\s*-\s*CBB[A-Z0-9]+.*$/i, '').trim()
  
  // "Aero Body Kit" ve "Carbon Look" kelimelerini koru
  const protectedTerms = ['Aero Body Kit', 'Carbon Look']
  const protectedMap: Record<string, string> = {}
  
  // Korunacak kelimeleri geçici olarak değiştir
  protectedTerms.forEach((term, index) => {
    const placeholder = `__PROTECTED_${index}__`
    protectedMap[placeholder] = term
    processed = processed.replace(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), placeholder)
  })
  
  // Tarih aralıklarını koru (örn: (2017-2022))
  const datePattern = /\((\d{4})-(\d{4})\)/g
  const dateMatches: Array<{ match: string; placeholder: string }> = []
  let dateIndex = 0
  processed = processed.replace(datePattern, (match) => {
    const placeholder = `__DATE_${dateIndex}__`
    dateMatches.push({ match, placeholder })
    dateIndex++
    return placeholder
  })
  
  // Çeviri sözlüğü (uzun ifadeler önce, kısa olanlar sonra)
  const translations: Array<[string, string]> = [
    ['suitable for', 'için uygun'],
    ['Front Bumper', 'Ön Tampon'],
    ['Rear Bumper', 'Arka Tampon'],
    ['Bumper Lip', 'Tampon Rüzgarlığı'],
    ['Air Diffuser', 'Hava Difüzörü'],
    ['Wheel Arches', 'Tekerlek Kemeri'],
    ['Piano Black', 'Piyano Siyahı'],
    ['M Performance', 'M Performans'],
    ['Extension', 'Uzatma'],
    ['Design', 'Tasarım'],
    ['Front', 'Ön'],
    ['Rear', 'Arka'],
    ['Bumper', 'Tampon'],
    ['Lip', 'Rüzgarlık'],
    ['Air', 'Hava'],
    ['Diffuser', 'Difüzör'],
    ['Wheel', 'Tekerlek'],
    ['Arches', 'Kemer'],
    ['Piano', 'Piyano'],
    ['Black', 'Siyah'],
    ['Performance', 'Performans'],
    ['suitable', 'uygun'],
    ['and', 've'],
    ['with', 'ile'],
    // 'for', 'in', 'on', 'at' gibi edatları çevirmiyoruz - bağlama göre değişir ve karışıklık yaratır
  ]
  
  // Çeviri yap (uzun ifadeler önce işlensin)
  translations.forEach(([en, tr]) => {
    const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    processed = processed.replace(regex, tr)
  })
  
  // Tarih aralıklarını geri yükle
  dateMatches.forEach(({ match, placeholder }) => {
    processed = processed.replace(placeholder, match)
  })
  
  // Korunacak kelimeleri geri yükle
  Object.entries(protectedMap).forEach(([placeholder, term]) => {
    processed = processed.replace(placeholder, term)
  })
  
  // Fazla boşlukları temizle
  processed = processed.replace(/\s+/g, ' ').trim()
  
  return processed
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'body-kits'
    const page = searchParams.get('page') || '1'

    // carpartstuning.com'dan ürünleri çek
    let url = ''
    if (category === 'body-kits') {
      url = page === '1' 
        ? 'https://www.carpartstuning.com/body-kits-tuning_3-3/'
        : `https://www.carpartstuning.com/body-kits-tuning_3-3/page-${page}/`
    } else if (category === 'accessories') {
      // Aksesuarlar için URL
      url = page === '1'
        ? 'https://www.carpartstuning.com/car-accessories-tuning_73-73/'
        : `https://www.carpartstuning.com/car-accessories-tuning_73-73/page-${page}/`
    } else {
      url = `https://www.carpartstuning.com/body-kits-tuning_3-3/page-${page}/`
    }

    console.log('Fetching from:', url)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.carpartstuning.com/',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const products: CarPartsProduct[] = []

    // Site yapısına göre ürün kartlarını bul
    // Farklı selector'ları dene
    const productSelectors = [
      '.product-item',
      '.product',
      '[class*="product"]',
      'article',
      '.item',
    ]

    let foundProducts = false

    for (const selector of productSelectors) {
      const elements = $(selector)
      
      if (elements.length > 0) {
        console.log(`Found ${elements.length} products using selector: ${selector}`)
        foundProducts = true

        elements.each((index, element) => {
          const $el = $(element)
          
          // Ürün adı - farklı selector'ları dene
          const nameSelectors = ['h2', 'h3', '.product-name', '[class*="name"]', 'a[title]', '.title']
          let name = ''
          for (const nameSel of nameSelectors) {
            const nameEl = $el.find(nameSel).first()
            if (nameSel === 'a[title]') {
              name = nameEl.attr('title') || nameEl.text().trim()
            } else {
              name = nameEl.text().trim()
            }
            if (name) break
          }

          // Görsel URL - SALE badge'i hariç tutarak gerçek ürün görselini bul
          let imageUrl = ''
          const allImages = $el.find('img')
          
          // Tüm görselleri kontrol et, SALE badge olmayan ilk görseli al
          for (let i = 0; i < allImages.length; i++) {
            const img = $(allImages[i])
            let imgSrc = img.attr('src') || 
                        img.attr('data-src') || 
                        img.attr('data-lazy-src') ||
                        img.attr('data-original') ||
                        ''
            
            // SALE badge kontrolü - bu görseli atla
            const imgSrcLower = imgSrc.toLowerCase()
            const imgAlt = (img.attr('alt') || '').toLowerCase()
            
            if (imgSrcLower.includes('sale_badge') || 
                imgSrcLower.includes('sale.png') || 
                imgSrcLower.includes('sale.jpg') ||
                imgSrcLower.includes('sale.gif') ||
                imgAlt.includes('sale') ||
                imgSrcLower.includes('badge')) {
              // Bu SALE badge, atla
              continue
            }
            
            // Gerçek ürün görseli bulundu
            imageUrl = imgSrc
            break
          }
          
          // Eğer hala görsel bulunamadıysa, ilk görseli al (ama SALE badge değilse)
          if (!imageUrl && allImages.length > 0) {
            const firstImg = $(allImages[0])
            const firstImgSrc = firstImg.attr('src') || firstImg.attr('data-src') || ''
            const firstImgSrcLower = firstImgSrc.toLowerCase()
            
            if (!firstImgSrcLower.includes('sale_badge') && 
                !firstImgSrcLower.includes('sale.png') && 
                !firstImgSrcLower.includes('sale.jpg')) {
              imageUrl = firstImgSrc
            }
          }
          
          // Relative URL'leri absolute yap
          if (imageUrl && !imageUrl.startsWith('http')) {
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl
            } else if (imageUrl.startsWith('/')) {
              imageUrl = 'https://www.carpartstuning.com' + imageUrl
            } else {
              imageUrl = 'https://www.carpartstuning.com/' + imageUrl
            }
          }

          // Ürün linki
          const linkEl = $el.find('a').first()
          let productLink = linkEl.attr('href') || ''
          if (productLink && !productLink.startsWith('http')) {
            if (productLink.startsWith('//')) {
              productLink = 'https:' + productLink
            } else if (productLink.startsWith('/')) {
              productLink = 'https://www.carpartstuning.com' + productLink
            } else {
              productLink = 'https://www.carpartstuning.com/' + productLink
            }
          }

          // Fiyat
          const priceSelectors = ['.price', '[class*="price"]', '.cost', '[class*="cost"]']
          let price = ''
          for (const priceSel of priceSelectors) {
            price = $el.find(priceSel).first().text().trim()
            if (price) break
          }

          // Açıklama
          const descSelectors = ['.description', '[class*="description"]', '.desc', '[class*="desc"]']
          let description = name
          for (const descSel of descSelectors) {
            const desc = $el.find(descSel).first().text().trim()
            if (desc && desc.length > 10) {
              description = desc
              break
            }
          }

          // Geçerli ürün kontrolü - SALE badge kontrolü kaldırıldı (artık SALE'li ürünler de gösterilecek)
          if (name && imageUrl && name.length > 3) {
            // Ürün adını işle: kodları kaldır, çevir
            const processedName = processProductName(name)
            
            products.push({
              id: `carparts-${category}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: processedName.substring(0, 200), // Maksimum uzunluk
              description: description.substring(0, 500),
              imageUrl,
              price: price || undefined,
              productUrl: productLink || url,
              category: category === 'body-kits' ? 'Body Kits' : 'Aksesuarlar',
            })
          }
        })

        if (products.length > 0) break
      }
    }

    // Eğer hiç ürün bulunamadıysa, HTML'i log'la
    if (!foundProducts || products.length === 0) {
      console.warn('No products found. HTML structure might have changed.')
      // HTML'in bir kısmını log'la (debug için)
      const bodyText = $('body').text().substring(0, 500)
      console.log('Body text sample:', bodyText)
    }

    // Duplicate'leri temizle (aynı isim ve görsel)
    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex((p) => p.name === product.name && p.imageUrl === product.imageUrl)
    )

    return NextResponse.json({ 
      success: true, 
      products: uniqueProducts,
      category,
      page: parseInt(page),
      total: uniqueProducts.length,
    })
  } catch (error: any) {
    console.error('Error fetching carparts products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        products: [],
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
