'use client'

import { useState, useEffect } from 'react'
import ServiceCard from '@/components/ServiceCard'
import { Service } from '@/lib/types'
import { getServices } from '@/lib/firestore'
import { fetchDriveImages } from '@/lib/drive-client'

export default function HizmetlerPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Hardcoded hizmetler - Firestore'da yoksa seed için kullanılacak
  const defaultServices: Omit<Service, 'id' | 'createdAt'>[] = [
    {
      name: 'Ses Sistemleri (Audio & Multimedya)',
      description: 'Aracınızın iç mekanını güçlü ve kaliteli bir müzik deneyimine dönüştürüyoruz. Hoparlör, subwoofer, amfi ve multimedya sistemleri ile net, dengeli ve yüksek kaliteli ses performansı sağlıyoruz. Tüm tesisatlar profesyonel şekilde, aracın orijinalliğine zarar vermeden uygulanır.',
      category: 'Performans',
      imageUrl: undefined,
    },
    {
      name: 'Egzoz Sistemleri ve Ses Modifikasyonu',
      description: 'Aracınızın dış karakterini belirleyen en önemli unsurlardan biri egzoz sesidir. Performans egzozu, downpipe ve özel üretim egzoz sistemleri ile daha tok, sportif ve agresif bir ses elde etmenizi sağlıyoruz. İsteğe bağlı olarak sessiz, orta veya yüksek ses seviyesinde ayarlamalar yapılabilir. Hem performans artışı hem de sürüş keyfi sunar.',
      category: 'Performans',
      imageUrl: undefined,
    },
    {
      name: 'Kaplama ve Detailing Hizmetleri',
      description: 'Aracınızı korur, görünümünü yenileriz. Renk değişimi folyo kaplama, PPF (boya koruma filmi), seramik kaplama ve detaylı temizlik hizmetleri ile showroom etkisi oluştururuz.',
      category: 'Görsel',
      imageUrl: undefined,
    },
    {
      name: 'Hava Emme ve Intercooler Sistemleri',
      description: 'Daha fazla ve daha soğuk hava, daha iyi yanma demektir. Performans hava filtreleri, cold air intake ve intercooler yükseltmeleri ile motor verimini artırıyoruz.',
      category: 'Performans',
      imageUrl: undefined,
    },
    {
      name: 'Süspansiyon ve Yol Tutuş Geliştirme',
      description: 'Aracınızın sürüş dinamiğini üst seviyeye taşıyoruz. Coilover, spor yay ve denge çubuğu uygulamaları ile hem daha agresif bir görünüm hem de daha güvenli yol tutuş sağlıyoruz.',
      category: 'Performans',
      imageUrl: undefined,
    },
    {
      name: 'Dyno Ölçüm ve Performans Analizi',
      description: 'Yapılan işlemlerin gerçek sonuçlarını görmek için dinamometre (dyno) ölçümü yapıyoruz. Öncesi-sonrası karşılaştırmaları ile aracınızın beygir gücü ve tork değerlerini net olarak raporluyoruz. Şeffaf ve ölçülebilir performans sunarız.',
      category: 'Analiz',
      imageUrl: undefined,
    },
    {
      name: 'Fren Sistemleri Güçlendirme',
      description: 'Artan güce paralel olarak güvenliği de artırıyoruz. Büyük disk, performans balatası ve çelik fren hortumları ile daha kısa fren mesafesi ve daha stabil duruş elde edersiniz.',
      category: 'Güvenlik',
      imageUrl: undefined,
    },
    {
      name: 'Görsel Modifiye ve Body Kit Uygulamaları',
      description: 'Aracınıza karakter kazandırıyoruz. Body kit, lip, difüzör, spoiler ve özel jant uygulamaları ile aracınızı tamamen size özel hale getiriyoruz.',
      category: 'Görsel',
      imageUrl: undefined,
    },
    {
      name: 'Far, Stop ve Aydınlatma Modifikasyonları',
      description: 'LED, Xenon ve özel animasyonlu stop far uygulamaları ile modern ve agresif bir görünüm sunuyoruz. Hem estetik hem de görüş güvenliği sağlar.',
      category: 'Görsel',
      imageUrl: undefined,
    },
    {
      name: 'Özel Proje ve Kişiye Özel Tuning',
      description: 'Standart paketlerin dışına çıkmak isteyenler için tamamen size özel çözümler üretiyoruz. Hayalinizdeki projeyi dinliyor, tasarlıyor ve gerçeğe dönüştürüyoruz. Emir Tuning\'de her araç bir imzadır.',
      category: 'Özel',
      imageUrl: undefined,
    },
  ]

  /** "Özel Proje" ile başlayan hizmeti her zaman listenin sonuna al */
  const sortServicesWithOzelLast = (list: Service[]): Service[] => {
    const ozel = list.filter((s) => s.name.startsWith('Özel Proje'))
    const rest = list.filter((s) => !s.name.startsWith('Özel Proje'))
    return [...rest, ...ozel]
  }

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const servicesData = await getServices()
      
      // Eğer Firestore'da hizmet yoksa, default hizmetleri seed et
      if (servicesData.length === 0) {
        try {
          const response = await fetch('/api/admin/seed-services', { method: 'POST' })
          const data = await response.json()
          if (data.success) {
            // Seed işlemi başarılı, tekrar yükle
            const newServices = await getServices()
            setServices(sortServicesWithOzelLast(newServices))
          } else {
            // Seed başarısız, default hizmetleri göster (geçici olarak)
            setServices(sortServicesWithOzelLast(defaultServices.map((s, i) => ({
              ...s,
              id: `temp-${i}`,
              createdAt: new Date(),
            })) as Service[]))
          }
        } catch (seedError) {
          console.error('Error seeding services:', seedError)
          // Seed başarısız, default hizmetleri göster (geçici olarak)
          setServices(sortServicesWithOzelLast(defaultServices.map((s, i) => ({
            ...s,
            id: `temp-${i}`,
            createdAt: new Date(),
          })) as Service[]))
        }
      } else {
        setServices(sortServicesWithOzelLast(servicesData))
      }
    } catch (error) {
      console.error('Error loading services:', error)
      // Hata durumunda default hizmetleri göster
      setServices(sortServicesWithOzelLast(defaultServices.map((s, i) => ({
        ...s,
        id: `temp-${i}`,
        createdAt: new Date(),
      })) as Service[]))
    } finally {
      setLoading(false)
    }
  }

  // Google Drive'dan görselleri çek
  useEffect(() => {
    if (services.length === 0 || loading) return

    async function loadServiceImages() {
      try {
        const images = await fetchDriveImages()
        
        // Hizmet adlarına göre görsel eşleştirmeleri
        const imageMappings: Record<string, string[]> = {
          'Ses Sistemleri': ['ses_sistemi.png', 'ses_sistemi'],
          'Egzoz Sistemleri': ['egzoz.png', 'egzoz'],
          'Kaplama ve Detailing': ['arac_kaplama.jpg', 'kaplama', 'detailing'],
          'Hava Emme': ['intercooler.png', 'intercooler'],
          'Süspansiyon': ['süspansiyon.png', 'suspansiyon', 'süspansiyon'],
          'Dyno Ölçüm': ['Dyno_testi.png', 'dyno', 'dyno_testi'],
          'Fren Sistemleri': ['fren_sistemi.jpg', 'fren'],
          'Görsel Modifiye': ['body_kit.jpg', 'body_kit', 'bodykit'],
          'Aydınlatma': ['stop_lamba.png', 'stop_lamba', 'stop', 'lamba'],
        }

        setServices(prevServices => 
          prevServices.map(service => {
            // Eğer zaten görsel varsa, değiştirme
            if (service.imageUrl) return service

            // Hizmet adına göre eşleştirme terimlerini bul
            let searchTerms: string[] = []
            for (const [key, terms] of Object.entries(imageMappings)) {
              if (service.name.includes(key)) {
                searchTerms = terms
                break
              }
            }

            // Alternatif olarak hizmet adından anahtar kelimeler çıkar
            if (searchTerms.length === 0) {
              const nameLower = service.name.toLowerCase()
              if (nameLower.includes('ses') || nameLower.includes('audio')) {
                searchTerms = ['ses_sistemi', 'ses']
              } else if (nameLower.includes('egzoz')) {
                searchTerms = ['egzoz']
              } else if (nameLower.includes('kaplama') || nameLower.includes('detailing')) {
                searchTerms = ['kaplama', 'detailing', 'arac_kaplama']
              } else if (nameLower.includes('hava') || nameLower.includes('intercooler')) {
                searchTerms = ['intercooler']
              } else if (nameLower.includes('süspansiyon') || nameLower.includes('suspansiyon')) {
                searchTerms = ['süspansiyon', 'suspansiyon']
              } else if (nameLower.includes('dyno')) {
                searchTerms = ['dyno', 'dyno_testi']
              } else if (nameLower.includes('fren')) {
                searchTerms = ['fren']
              } else if (nameLower.includes('body') || nameLower.includes('modifiye')) {
                searchTerms = ['body_kit', 'bodykit']
              } else if (nameLower.includes('aydınlatma') || nameLower.includes('far') || nameLower.includes('stop')) {
                searchTerms = ['stop_lamba', 'stop', 'lamba']
              }
            }

            if (searchTerms.length === 0) return service

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Hizmetler yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* Hizmetler Grid - Yan yana maksimum 4 box */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
