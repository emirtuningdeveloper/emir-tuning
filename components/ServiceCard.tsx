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
    <div className="bg-white rounded-card-lg shadow-card border border-gray-100/80 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Image / Icon area */}
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/80 shadow-soft ring-2 ring-primary-100/50">
            <IconComponent className="w-8 h-8 text-primary-600" />
          </div>
        )}
      </div>
      
      <div className="p-5 md:p-6">
        <div className="mb-3">
          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-chip border border-primary-100/80">
            {service.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug tracking-tight">
          {service.name}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
          {service.description}
        </p>
      </div>
    </div>
  )
}
