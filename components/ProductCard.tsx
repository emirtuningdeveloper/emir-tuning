import { Product } from '@/lib/types'
import { Package } from 'lucide-react'

interface ProductCardProps {
  product: Product
  /** Slider/carousel variant: tighter layout, premium hover */
  variant?: 'default' | 'slider'
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  // Kategori yolu "Ana > Alt > Son" ise sadece son kısmı göster (örn. "Body Kit Setler")
  const displayCategory =
    product.category && product.category.includes(' > ')
      ? product.category.split(' > ').pop()?.trim() || product.category
      : product.category

  const isSlider = variant === 'slider'

  return (
    <div className={`bg-white/5 rounded-card-lg border border-white/10 overflow-hidden transition-all duration-300 group hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 ${isSlider ? '' : ''}`}>
      {product.imageUrl ? (
        <div className="relative aspect-[4/3] w-full bg-white/5 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const placeholder = target.parentElement?.querySelector('.image-placeholder')
              if (placeholder) {
                (placeholder as HTMLElement).style.display = 'flex'
              }
            }}
          />
          <div className="image-placeholder absolute inset-0 bg-white/5 flex items-center justify-center" style={{ display: 'none' }}>
            <Package className="w-12 h-12 text-primary-400" />
          </div>
        </div>
      ) : (
        <div className="aspect-[4/3] w-full bg-white/5 flex items-center justify-center">
          <Package className="w-12 h-12 text-primary-400" />
        </div>
      )}
      
      <div className={isSlider ? 'p-3 md:p-4' : 'p-4 md:p-5'}>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="inline-block bg-white/10 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-chip border border-white/10">
            {displayCategory}
          </span>
          {product.outOfStock && (
            <span className="inline-block bg-red-500/20 text-red-400 text-xs font-medium px-2.5 py-1 rounded-chip border border-red-500/30">
              Stok bitti
            </span>
          )}
        </div>
        
        <h3 className={`font-semibold text-white mb-2 line-clamp-2 leading-snug tracking-tight ${isSlider ? 'text-sm' : 'text-base line-clamp-3'}`}>
          {product.name}
        </h3>
        
        <p className={`text-gray-400 leading-relaxed ${isSlider ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
          {product.description}
        </p>

        {product.features && product.features.length > 0 && (
          <div className="border-t border-white/10 mt-4 pt-4">
            <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Özellikler</h4>
            <ul className="space-y-1.5">
              {product.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
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
