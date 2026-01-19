'use client'

import { useState, useEffect } from 'react'
import ServiceCard from '@/components/ServiceCard'
import { Service } from '@/lib/types'
import { fetchDriveImages } from '@/lib/drive-client'

export default function HizmetlerPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: 'ses-sistemleri',
      name: 'Ses Sistemleri (Audio & Multimedya)',
      description: 'Aracınızın iç mekanını güçlü ve kaliteli bir müzik deneyimine dönüştürüyoruz. Hoparlör, subwoofer, amfi ve multimedya sistemleri ile net, dengeli ve yüksek kaliteli ses performansı sağlıyoruz. Tüm tesisatlar profesyonel şekilde, aracın orijinalliğine zarar vermeden uygulanır.',
      category: 'Performans',
      imageUrl: undefined,
      createdAt: new Date(),
    },
    {
      id: 'egzoz-sistemleri',
      name: 'Egzoz Sistemleri ve Ses Modifikasyonu',
      description: 'Aracınızın dış karakterini belirleyen en önemli unsurlardan biri egzoz sesidir. Performans egzozu, downpipe ve özel üretim egzoz sistemleri ile daha tok, sportif ve agresif bir ses elde etmenizi sağlıyoruz. İsteğe bağlı olarak sessiz, orta veya yüksek ses seviyesinde ayarlamalar yapılabilir. Hem performans artışı hem de sürüş keyfi sunar.',
      category: 'Performans',
      imageUrl: undefined,
      createdAt: new Date(),
    },
    {
      id: 'kaplama-detailing',
      name: 'Kaplama ve Detailing Hizmetleri',
      description: 'Aracınızı korur, görünümünü yenileriz. Renk değişimi folyo kaplama, PPF (boya koruma filmi), seramik kaplama ve detaylı temizlik hizmetleri ile showroom etkisi oluştururuz.',
      category: 'Görsel',
      imageUrl: undefined, // arac_kaplama.jpg
      createdAt: new Date(),
    },
    {
      id: 'hava-emme-intercooler',
      name: 'Hava Emme ve Intercooler Sistemleri',
      description: 'Daha fazla ve daha soğuk hava, daha iyi yanma demektir. Performans hava filtreleri, cold air intake ve intercooler yükseltmeleri ile motor verimini artırıyoruz.',
      category: 'Performans',
      imageUrl: undefined, // intercooler.png
      createdAt: new Date(),
    },
    {
      id: 'suspansiyon-yol-tutush',
      name: 'Süspansiyon ve Yol Tutuş Geliştirme',
      description: 'Aracınızın sürüş dinamiğini üst seviyeye taşıyoruz. Coilover, spor yay ve denge çubuğu uygulamaları ile hem daha agresif bir görünüm hem de daha güvenli yol tutuş sağlıyoruz.',
      category: 'Performans',
      imageUrl: undefined, // süspansiyon.png
      createdAt: new Date(),
    },
    {
      id: 'dyno-olcum',
      name: 'Dyno Ölçüm ve Performans Analizi',
      description: 'Yapılan işlemlerin gerçek sonuçlarını görmek için dinamometre (dyno) ölçümü yapıyoruz. Öncesi-sonrası karşılaştırmaları ile aracınızın beygir gücü ve tork değerlerini net olarak raporluyoruz. Şeffaf ve ölçülebilir performans sunarız.',
      category: 'Analiz',
      imageUrl: undefined, // Dyno_testi.png
      createdAt: new Date(),
    },
    {
      id: 'fren-sistemleri',
      name: 'Fren Sistemleri Güçlendirme',
      description: 'Artan güce paralel olarak güvenliği de artırıyoruz. Büyük disk, performans balatası ve çelik fren hortumları ile daha kısa fren mesafesi ve daha stabil duruş elde edersiniz.',
      category: 'Güvenlik',
      imageUrl: undefined, // fren_sistemi.jpg
      createdAt: new Date(),
    },
    {
      id: 'gorsel-modifiye',
      name: 'Görsel Modifiye ve Body Kit Uygulamaları',
      description: 'Aracınıza karakter kazandırıyoruz. Body kit, lip, difüzör, spoiler ve özel jant uygulamaları ile aracınızı tamamen size özel hale getiriyoruz.',
      category: 'Görsel',
      imageUrl: undefined, // body_kit.jpg
      createdAt: new Date(),
    },
    {
      id: 'aydinlatma',
      name: 'Far, Stop ve Aydınlatma Modifikasyonları',
      description: 'LED, Xenon ve özel animasyonlu stop far uygulamaları ile modern ve agresif bir görünüm sunuyoruz. Hem estetik hem de görüş güvenliği sağlar.',
      category: 'Görsel',
      imageUrl: undefined, // stop_lamba.png
      createdAt: new Date(),
    },
    {
      id: 'ozel-proje',
      name: 'Özel Proje ve Kişiye Özel Tuning',
      description: 'Standart paketlerin dışına çıkmak isteyenler için tamamen size özel çözümler üretiyoruz. Hayalinizdeki projeyi dinliyor, tasarlıyor ve gerçeğe dönüştürüyoruz. Emir Tuning\'de her araç bir imzadır.',
      category: 'Özel',
      imageUrl: undefined, // Temsili foto kalacak
      createdAt: new Date(),
    },
  ])

  // Google Drive'dan görselleri çek
  useEffect(() => {
    async function loadServiceImages() {
      try {
        const images = await fetchDriveImages()
        
        // Hizmet ID'lerine göre görsel eşleştirmeleri
        const imageMappings: Record<string, string[]> = {
          'ses-sistemleri': ['ses_sistemi.png', 'ses_sistemi'],
          'egzoz-sistemleri': ['egzoz.png', 'egzoz'],
          'kaplama-detailing': ['arac_kaplama.jpg', 'kaplama', 'detailing'],
          'hava-emme-intercooler': ['intercooler.png', 'intercooler'],
          'suspansiyon-yol-tutush': ['süspansiyon.png', 'suspansiyon', 'süspansiyon'],
          'dyno-olcum': ['Dyno_testi.png', 'dyno', 'dyno_testi'],
          'fren-sistemleri': ['fren_sistemi.jpg', 'fren'],
          'gorsel-modifiye': ['body_kit.jpg', 'body_kit', 'bodykit'],
          'aydinlatma': ['stop_lamba.png', 'stop_lamba', 'stop', 'lamba'],
        }

        setServices(prevServices => 
          prevServices.map(service => {
            const searchTerms = imageMappings[service.id] || []
            if (searchTerms.length === 0) return service // Özel proje için görsel yok

            // Görseli bul
            let foundImage = null
            for (const term of searchTerms) {
              foundImage = images.find(img => 
                img.name.toLowerCase().includes(term.toLowerCase())
              )
              if (foundImage) break
            }

            if (foundImage) {
              // Proxy URL kullan
              const proxiedUrl = `/api/carparts/image?url=${encodeURIComponent(foundImage.publicUrl)}`
              return { ...service, imageUrl: proxiedUrl }
            }

            return service
          })
        )
      } catch (error) {
        console.error('Error loading service images:', error)
      }
    }

    loadServiceImages()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Hizmetlerimiz
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Profesyonel tuning hizmetlerimizle araçlarınıza değer katın
        </p>
      </div>

      {/* Hizmetler Grid - Yan yana maksimum 4 box */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
