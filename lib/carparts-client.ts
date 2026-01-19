export interface CarPartsProduct {
  id: string
  name: string
  description: string
  imageUrl: string
  price?: string
  productUrl: string
  category: string
}

export async function fetchCarPartsProducts(
  category: string = 'body-kits',
  page: number = 1
): Promise<CarPartsProduct[]> {
  try {
    const response = await fetch(
      `/api/carparts/products?category=${category}&page=${page}`,
      {
        cache: 'no-store', // Her zaman fresh data
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      console.error('API returned error:', data.error)
      return []
    }

    return data.products || []
  } catch (error: any) {
    console.error('Error fetching carparts products:', error)
    return []
  }
}

export function getProxiedImageUrl(originalUrl: string): string {
  // Görseli proxy üzerinden göster
  if (!originalUrl) return ''
  
  // Eğer zaten proxy URL'i ise, direkt dön
  if (originalUrl.includes('/api/carparts/image')) {
    return originalUrl
  }

  // Proxy URL'i oluştur
  return `/api/carparts/image?url=${encodeURIComponent(originalUrl)}`
}
