'use client'

import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/firestore'
import { fetchDriveImages } from '@/lib/drive-client'
import { fetchCarPartsProducts, getProxiedImageUrl, CarPartsProduct } from '@/lib/carparts-client'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
              imageUrl: kirmiziBmw.publicUrl,
              createdAt: new Date(),
            })
          }
          
          if (turuncuBmw) {
            sampleProducts.push({
              id: 'drive-turuncu-bmw',
              name: 'Turuncu BMW Tuning',
              description: 'Gösterişli turuncu renk seçeneği ile BMW araçlarınız için özel tuning çözümleri.',
              category: 'BMW Tuning',
              imageUrl: turuncuBmw.publicUrl,
              createdAt: new Date(),
            })
          }
          
          if (sariBmw) {
            sampleProducts.push({
              id: 'drive-sari-bmw',
              name: 'Sarı BMW Tuning',
              description: 'Dikkat çekici sarı renk seçeneği ile BMW araçlarınız için özel tuning çözümleri.',
              category: 'BMW Tuning',
              imageUrl: sariBmw.publicUrl,
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
                imageUrl: matchingImage.publicUrl,
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
        
        // 6. Aksesuarlar kategorisi için boş bir kategori ekle (UI'da gösterilecek)
        // Şimdilik boş, gelecekte eklenebilir
        
        console.log('Total products:', allProducts.length)
        setProducts(allProducts)
        
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

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  const categories = Object.keys(productsByCategory)

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

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            Henüz ürün eklenmemiş. Yakında burada olacak!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Body Kits Kategorisi */}
          {productsByCategory['Body Kits'] && productsByCategory['Body Kits'].length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-primary-500 pb-2">
                Body Kits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory['Body Kits'].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
          
          {/* Aksesuarlar Kategorisi (şimdilik boş) */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-primary-500 pb-2">
              Aksesuarlar
            </h2>
            {productsByCategory['Aksesuarlar'] && productsByCategory['Aksesuarlar'].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory['Aksesuarlar'].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Yakında burada olacak!</p>
              </div>
            )}
          </div>
          
          {/* Diğer kategoriler (Firestore'dan gelenler) */}
          {categories
            .filter(cat => cat !== 'Body Kits' && cat !== 'Aksesuarlar')
            .map((category) => (
              <div key={category}>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-primary-500 pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsByCategory[category].map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
