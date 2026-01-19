'use client'

import { Award, Users, Target, Heart } from 'lucide-react'

export default function HakkimizdaPage() {
  const values = [
    {
      icon: Target,
      title: 'Misyonumuz',
      description: 'Müşterilerimize en kaliteli tuning ürünleri ve hizmetlerini sunarak, araçlarının performansını ve görünümünü en üst seviyeye çıkarmak.',
    },
    {
      icon: Heart,
      title: 'Vizyonumuz',
      description: 'Türkiye\'nin önde gelen tuning merkezi olmak ve sektörde kalite standartlarını belirlemek.',
    },
    {
      icon: Award,
      title: 'Kalite',
      description: 'Tüm ürün ve hizmetlerimizde en yüksek kalite standartlarını koruyor, müşteri memnuniyetini ön planda tutuyoruz.',
    },
    {
      icon: Users,
      title: 'Uzman Ekip',
      description: 'Yılların deneyimine sahip uzman ekibimizle, her projede mükemmellik hedefliyoruz.',
    },
  ]

  const stats = [
    { number: '10+', label: 'Yıllık Deneyim' },
    { number: '500+', label: 'Mutlu Müşteri' },
    { number: '1000+', label: 'Tamamlanan Proje' },
    { number: '50+', label: 'Ürün Kategorisi' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hakkımızda
            </h1>
            <p className="text-xl md:text-2xl text-primary-100">
              Otomotiv Tuning Dünyasında Güvenilir Çözüm Ortağınız
            </p>
          </div>
        </div>
      </section>

      {/* Hikayemiz */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Hikayemiz
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
              <p>
                Emir Tuning olarak, otomotiv tuning sektöründe yılların deneyimi ile müşterilerimize 
                en kaliteli ürünleri ve profesyonel hizmetleri sunmaktan gurur duyuyoruz.
              </p>
              <p>
                2014 yılından beri faaliyet gösteren firmamız, başlangıçta küçük bir atölye olarak 
                hizmet vermeye başladı. Zaman içinde müşteri memnuniyeti ve kalite odaklı yaklaşımımız 
                sayesinde, sektörün önde gelen isimlerinden biri haline geldik.
              </p>
              <p>
                Bugün, geniş ürün yelpazemiz ve uzman ekibimizle, araç sahiplerinin hayallerindeki 
                performans ve görünüme ulaşmalarına yardımcı oluyoruz. Her projede mükemmellik 
                hedefliyor, müşterilerimizin güvenini kazanmak için çalışıyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Değerlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Çalışma prensiplerimiz ve değerlerimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neden Bizi Seçmelisiniz */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Neden Bizi Seçmelisiniz?
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Geniş Ürün Yelpazesi</h3>
                  <p className="text-gray-600">
                    Tuning dünyasının en kaliteli markalarını bünyemizde bulunduruyoruz.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Uzman Ekip</h3>
                  <p className="text-gray-600">
                    Yılların deneyimine sahip teknik ekibimizle her projede mükemmellik hedefliyoruz.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Kalite Garantisi</h3>
                  <p className="text-gray-600">
                    Tüm ürün ve hizmetlerimizde kalite garantisi sunuyoruz.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Müşteri Odaklı Hizmet</h3>
                  <p className="text-gray-600">
                    Her müşterimizin ihtiyacına özel çözümler üretiyor, memnuniyeti ön planda tutuyoruz.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Rekabetçi Fiyatlar</h3>
                  <p className="text-gray-600">
                    Kaliteli ürün ve hizmetleri uygun fiyatlarla sunuyoruz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
