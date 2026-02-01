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
    <div className="bg-white/5 rounded-card-lg border border-white/10 overflow-hidden hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Image / Icon area */}
      <div className="relative aspect-[16/9] w-full bg-white/5 flex items-center justify-center overflow-hidden">
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
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 ring-2 ring-white/20">
            <IconComponent className="w-8 h-8 text-primary-400" />
          </div>
        )}
      </div>
      
      <div className="p-5 md:p-6">
        <div className="mb-3">
          <span className="inline-block bg-white/10 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-chip border border-white/10">
            {service.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 leading-snug tracking-tight">
          {service.name}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
          {service.description}
        </p>
      </div>
    </div>
  )
}
