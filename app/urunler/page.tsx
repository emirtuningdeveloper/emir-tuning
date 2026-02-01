'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getProducts, getSiteSettings } from '@/lib/firestore'
import { fetchDriveImages } from '@/lib/drive-client'
import { fetchCarPartsProducts, CarPartsProduct } from '@/lib/carparts-client'
import { getProxiedImageUrl } from '@/lib/image-proxy'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types'
import { productCategories, Category } from '@/lib/product-categories'
import { Loader2, ChevronLeft, ChevronRight, Package, Folder } from 'lucide-react'

/** En çok satanlar slider: otomatik yavaş kayma, alt tuşlar, akıcı geçiş (px/s). Kart ~260px + gap 20px */
const FEATURED_SCROLL_SPEED = 24
const FEATURED_ITEM_WIDTH = 280
const FEATURED_ANIM_MS = 500

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(productCategories)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [featuredPaused, setFeaturedPaused] = useState(false)
  const featuredContainerRef = useRef<HTMLDivElement>(null)
  const featuredTrackRef = useRef<HTMLDivElement>(null)
  const featuredOffsetRef = useRef(0)
  const featuredRafRef = useRef<number>(0)
  const featuredAnimatingRef = useRef(false)

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategories(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)
        
        const allProducts: Product[] = []
        
        // 1. Firestore'dan ürünleri çek (mevcut sistem)
        let firestoreProducts: Product[] = []
        try {
          firestoreProducts = await getProducts()
          console.log('Firestore products:', firestoreProducts.length)
          allProducts.push(...firestoreProducts)
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError)
        }
        
        // 2. Google Drive'dan görselleri çek (mevcut sistem)
        let driveImages: any[] = []
        try {
          driveImages = await fetchDriveImages()
          console.log('Drive images:', driveImages.length)
        } catch (driveError: any) {
          console.error('Drive API error:', driveError)
        }
        
        // 3. carpartstuning.com'dan Body Kits ürünlerini çek
        try {
          console.log('Fetching Body Kits from carpartstuning.com...')
          const bodyKitsProducts = await fetchCarPartsProducts('body-kits', 1)
          console.log('Body Kits products fetched:', bodyKitsProducts.length)
          
          // CarPartsProduct'ları Product formatına çevir (fiyat gösterilmeyecek)
          const convertedBodyKits: Product[] = bodyKitsProducts.map((cp: CarPartsProduct) => ({
            id: cp.id,
            name: cp.name,
            description: cp.description,
            category: 'Body Kits',
            imageUrl: getProxiedImageUrl(cp.imageUrl), // Proxy üzerinden göster
            createdAt: new Date(),
            // Fiyat gösterilmeyecek
          }))
          
          allProducts.push(...convertedBodyKits)
        } catch (carpartsError: any) {
          console.error('CarParts API error:', carpartsError)
          // Hata olsa bile devam et
        }
        
        // 4. Aksesuarlar kategorisi (şimdilik boş, gelecekte eklenebilir)
        // const accessoriesProducts = await fetchCarPartsProducts('accessories', 1)
        
        // 5. Eğer Firestore'da ürün yoksa ama Drive'da görseller varsa, örnek ürünler oluştur
        if (firestoreProducts.length === 0 && driveImages.length > 0 && allProducts.length === 0) {
          console.log('Creating sample products from Drive images')
          const sampleProducts: Product[] = []
          
          const kirmiziBmw = driveImages.find(img => 
            img.name.toLowerCase().includes('kirmizi_bmw') || 
            (img.name.toLowerCase().includes('kirmizi') && img.name.toLowerCase().includes('bmw'))
          )
          const turuncuBmw = driveImages.find(img => 
            img.name.toLowerCase().includes('turuncu_bmw') || 
            (img.name.toLowerCase().includes('turuncu') && img.name.toLowerCase().includes('bmw'))
          )
          const sariBmw = driveImages.find(img => 
            img.name.toLowerCase().includes('sari_bmw') || 
            (img.name.toLowerCase().includes('sari') && img.name.toLowerCase().includes('bmw'))
          )
          
          if (kirmiziBmw) {
            sampleProducts.push({
              id: 'drive-kirmizi-bmw',
              name: 'Kırmızı BMW Tuning',
              description: 'Premium kırmızı renk seçeneği ile BMW araçlarınız için özel tuning çözümleri.',
              category: 'BMW Tuning',
              imageUrl: getProxiedImageUrl(kirmiziBmw.publicUrl),
              createdAt: new Date(),
            })
          }
          
          if (turuncuBmw) {
            sampleProducts.push({
              id: 'drive-turuncu-bmw',
              name: 'Turuncu BMW Tuning',
              description: 'Gösterişli turuncu renk seçeneği ile BMW araçlarınız için özel tuning çözümleri.',
              category: 'BMW Tuning',
              imageUrl: getProxiedImageUrl(turuncuBmw.publicUrl),
              createdAt: new Date(),
            })
          }
          
          if (sariBmw) {
            sampleProducts.push({
              id: 'drive-sari-bmw',
              name: 'Sarı BMW Tuning',
              description: 'Dikkat çekici sarı renk seçeneği ile BMW araçlarınız için özel tuning çözümleri.',
              category: 'BMW Tuning',
              imageUrl: getProxiedImageUrl(sariBmw.publicUrl),
              createdAt: new Date(),
            })
          }
          
          allProducts.push(...sampleProducts)
        } else if (firestoreProducts.length > 0) {
          // Firestore ürünlerine Drive görsellerini ekle
          const productsWithImages = firestoreProducts.map((product) => {
            if (product.imageUrl) {
              return product
            }
            
            const productNameLower = product.name.toLowerCase()
            const matchingImage = driveImages.find((img) => {
              const imgNameLower = img.name.toLowerCase().replace(/\.(jpg|png|jpeg|gif|webp)$/i, '')
              return productNameLower.includes(imgNameLower.replace(/_/g, ' ')) || 
                     imgNameLower.includes(productNameLower.replace(/\s+/g, '_'))
            })
            
            if (matchingImage) {
              return {
                ...product,
                imageUrl: getProxiedImageUrl(matchingImage.publicUrl),
              }
            }
            
            return product
          })
          
          // Firestore ürünlerini güncelle
          const updatedProducts = allProducts.map(p => {
            const updated = productsWithImages.find(fp => fp.id === p.id)
            return updated || p
          })
          
          // Yeni ürünleri ekle
          productsWithImages.forEach(fp => {
            if (!updatedProducts.find(p => p.id === fp.id)) {
              updatedProducts.push(fp)
            }
          })
          
          allProducts.splice(0, allProducts.length, ...updatedProducts)
        }
        
        // 6. Stok bitti bilgisini birleştir
        try {
          const stokRes = await fetch('/api/products/out-of-stock-ids')
          const stokData = await stokRes.json()
          if (stokData.success && Array.isArray(stokData.ids)) {
            const idSet = new Set(stokData.ids)
            for (let i = 0; i < allProducts.length; i++) {
              const p = allProducts[i]
              allProducts[i] = {
                ...p,
                outOfStock: idSet.has(p.id) || idSet.has(`drstuning_${p.id}`),
              }
            }
          }
        } catch (_) {
          /* ignore */
        }
        
        console.log('Total products:', allProducts.length)
        setProducts(allProducts)

        // En çok satanlar slider: ayarlardan kategorileri al, ürünleri çek
        try {
          const settings = await getSiteSettings()
          const paths = settings?.featuredSliderCategoryPaths ?? []
          let sliderList: Product[] = []
          if (paths.length > 0) {
            const byCategoryResponses = await Promise.all(
              paths.map((categoryPath) =>
                fetch(`/api/products/by-category?categoryPath=${encodeURIComponent(categoryPath)}&page=1`, { cache: 'no-store' }).then((r) => r.json())
              )
            )
            const byCategoryProducts: Product[] = []
            for (const data of byCategoryResponses) {
              if (data?.success && Array.isArray(data.products)) {
                for (const p of data.products) {
                  byCategoryProducts.push({
                    id: p.id,
                    name: p.name,
                    description: '',
                    category: '',
                    imageUrl: getProxiedImageUrl(p.imageUrl),
                    createdAt: new Date(),
                  })
                }
              }
            }
            sliderList = shuffle(byCategoryProducts).slice(0, 24)
          } else {
            sliderList = shuffle(allProducts).slice(0, 24)
          }
          setFeaturedProducts(sliderList)
        } catch (_) {
          setFeaturedProducts(shuffle(allProducts).slice(0, 24))
        }
        
      } catch (err: any) {
        console.error('Error loading products:', err)
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // En çok satanlar: otomatik yavaş kayma
  const featuredSegmentWidth = featuredProducts.length * FEATURED_ITEM_WIDTH
  useEffect(() => {
    const track = featuredTrackRef.current
    if (!track || featuredProducts.length === 0 || featuredSegmentWidth <= 0) return
    let last = performance.now()
    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      if (!featuredPaused && !featuredAnimatingRef.current) {
        featuredOffsetRef.current += FEATURED_SCROLL_SPEED * dt
        const seg = featuredSegmentWidth
        while (featuredOffsetRef.current >= seg) featuredOffsetRef.current -= seg
        track.style.transform = `translateX(-${featuredOffsetRef.current}px)`
      }
      featuredRafRef.current = requestAnimationFrame(tick)
    }
    featuredRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(featuredRafRef.current)
  }, [featuredProducts.length, featuredPaused, featuredSegmentWidth])

  const featuredGoPrev = useCallback(() => {
    const track = featuredTrackRef.current
    if (featuredProducts.length === 0 || !track || featuredAnimatingRef.current) return
    featuredAnimatingRef.current = true
    const seg = featuredProducts.length * FEATURED_ITEM_WIDTH
    const target = (featuredOffsetRef.current - FEATURED_ITEM_WIDTH + seg) % seg
    track.style.transition = `transform ${FEATURED_ANIM_MS}ms ease-out`
    track.style.transform = `translateX(-${target}px)`
    setTimeout(() => {
      if (!featuredTrackRef.current) return
      featuredOffsetRef.current = target
      featuredTrackRef.current.style.transition = ''
      featuredAnimatingRef.current = false
    }, FEATURED_ANIM_MS)
  }, [featuredProducts.length])

  const featuredGoNext = useCallback(() => {
    const track = featuredTrackRef.current
    if (featuredProducts.length === 0 || !track || featuredAnimatingRef.current) return
    featuredAnimatingRef.current = true
    const seg = featuredProducts.length * FEATURED_ITEM_WIDTH
    const target = (featuredOffsetRef.current + FEATURED_ITEM_WIDTH) % seg
    track.style.transition = `transform ${FEATURED_ANIM_MS}ms ease-out`
    track.style.transform = `translateX(-${target}px)`
    setTimeout(() => {
      if (!featuredTrackRef.current) return
      featuredOffsetRef.current = target
      featuredTrackRef.current.style.transition = ''
      featuredAnimatingRef.current = false
    }, FEATURED_ANIM_MS)
  }, [featuredProducts.length])

  // Group products by category (ürünler sayfasındaki "Diğer kategoriler" bölümü için)
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  const productCategoryNames = Object.keys(productsByCategory)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Ürünler yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <p className="text-gray-500 text-sm">
            Firebase konfigürasyonunuzu kontrol edin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Ürünlerimiz
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tuning dünyasının en kaliteli ürünlerini keşfedin
        </p>
      </div>

      {/* Product Categories */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Ürün Kategorileri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/urunler/${category.slug}`}
              className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Folder className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  {category.title}
                </h3>
              </div>
              {category.children && category.children.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {category.children.length} alt kategori
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-anthracite-100 pt-12 mt-12">

      {/* En çok satanlar – otomatik yavaş kayma, alt tuşlar, akıcı geçiş (gölgeli kartlar) */}
      {featuredProducts.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-anthracite-900 tracking-tight">
              En çok satanlar
            </h2>
          </div>
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setFeaturedPaused(true)}
            onMouseLeave={() => setFeaturedPaused(false)}
          >
            <div ref={featuredContainerRef} className="overflow-hidden">
              <div
                ref={featuredTrackRef}
                className="flex gap-5 will-change-transform"
                style={{ width: 'max-content' }}
              >
                {[...featuredProducts, ...featuredProducts].map((product, i) => (
                  <div
                    key={`${product.id}-${i}`}
                    className="flex-shrink-0 w-52 sm:w-60"
                    style={{ width: 260, minWidth: 260 }}
                  >
                    <ProductCard product={product} variant="slider" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={featuredGoPrev}
                className="w-9 h-9 rounded-full border border-anthracite-200 bg-white flex items-center justify-center text-anthracite-600 hover:bg-anthracite-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Önceki"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={featuredGoNext}
                className="w-9 h-9 rounded-full border border-anthracite-200 bg-white flex items-center justify-center text-anthracite-600 hover:bg-anthracite-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Sonraki"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-anthracite-600 text-lg">
            Henüz ürün eklenmemiş. Yakında burada olacak!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Diğer kategoriler (Body Kits block removed; Firestore kategorileri) */}
          {productCategoryNames
            .filter(cat => cat !== 'Body Kits')
            .map((categoryName) => (
              <div key={categoryName}>
                <div className="flex items-center justify-between mb-8 border-b border-anthracite-200 pb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-anthracite-900 tracking-tight">
                    {categoryName}
                  </h2>
                  {productsByCategory[categoryName] && productsByCategory[categoryName].length > 0 && (
                    <p className="text-anthracite-600 text-sm">
                      {productsByCategory[categoryName].length} ürün gösteriliyor
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {productsByCategory[categoryName].map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
      </div>
    </div>
  )
}
