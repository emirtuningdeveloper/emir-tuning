import { Product } from '@/lib/types'
import { Package } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  // Kategori yolu "Ana > Alt > Son" ise sadece son kısmı göster (örn. "Body Kit Setler")
  const displayCategory =
    product.category && product.category.includes(' > ')
      ? product.category.split(' > ').pop()?.trim() || product.category
      : product.category

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {product.imageUrl ? (
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Görsel yüklenemezse placeholder göster
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const placeholder = target.parentElement?.querySelector('.image-placeholder')
              if (placeholder) {
                (placeholder as HTMLElement).style.display = 'flex'
              }
            }}
          />
          <div className="image-placeholder absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center" style={{ display: 'none' }}>
            <Package className="w-16 h-16 text-primary-600" />
          </div>
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <Package className="w-16 h-16 text-primary-600" />
        </div>
      )}
      
      <div className="p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded">
            {displayCategory}
          </span>
          {product.outOfStock && (
            <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
              Stok bitti
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {product.description}
        </p>

        {product.features && product.features.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Özellikler:</h4>
            <ul className="space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
