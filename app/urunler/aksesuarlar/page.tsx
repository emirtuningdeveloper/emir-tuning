'use client'

import { useEffect, useState } from 'react'
import { fetchCarPartsProducts, getProxiedImageUrl, CarPartsProduct } from '@/lib/carparts-client'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function AksesuarlarPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching accessories from carpartstuning.com...')
        const accessoriesProducts = await fetchCarPartsProducts('accessories', 1)
        console.log('Accessories products fetched:', accessoriesProducts.length)
        
        // CarPartsProduct'ları Product formatına çevir (fiyat gösterilmeyecek)
        const convertedProducts: Product[] = accessoriesProducts.map((cp: CarPartsProduct) => ({
          id: cp.id,
          name: cp.name,
          description: cp.description,
          category: 'Aksesuarlar',
          imageUrl: getProxiedImageUrl(cp.imageUrl), // Proxy üzerinden göster
          createdAt: new Date(),
          // Fiyat gösterilmeyecek
        }))
        
        console.log('Total accessories products:', convertedProducts.length)
        setProducts(convertedProducts)
        
      } catch (err: any) {
        console.error('Error loading accessories:', err)
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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
            Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Araç Aksesuarları
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Araçlarınız için kaliteli aksesuarları keşfedin
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            Henüz ürün eklenmemiş. Yakında burada olacak!
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-primary-500 pb-2">
            Aksesuarlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
