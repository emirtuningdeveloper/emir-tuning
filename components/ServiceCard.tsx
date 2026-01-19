import { Service } from '@/lib/types'
import { Wrench, Settings, Zap, Gauge, Shield, Sparkles, Palette, Lightbulb, Star } from 'lucide-react'

interface ServiceCardProps {
  service: Service
}

// Her hizmet için temsili icon
const serviceIcons: Record<string, any> = {
  'ses-sistemleri': Settings,
  'egzoz-sistemleri': Settings,
  'kaplama-detailing': Palette,
  'hava-emme-intercooler': Zap,
  'suspansiyon-yol-tutush': Gauge,
  'dyno-olcum': Gauge,
  'fren-sistemleri': Shield,
  'gorsel-modifiye': Sparkles,
  'aydinlatma': Lightbulb,
  'ozel-proje': Star,
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent = serviceIcons[service.id] || Wrench

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
      {/* Mini Görsel Kısmı */}
      <div className="relative h-32 w-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex items-center justify-center">
            <IconComponent className="w-16 h-16 text-primary-600" />
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="mb-3">
          <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
            {service.category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {service.name}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
          {service.description}
        </p>
      </div>
    </div>
  )
}
