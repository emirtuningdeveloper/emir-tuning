'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getSiteSettings } from '@/lib/firestore'
import { AboutValueItem } from '@/lib/types'
import IconFromName from '@/components/IconFromName'

const DEFAULT_ABOUT = `Emir Tuning olarak, otomotiv tuning sektöründe yılların deneyimi ile müşterilerimize en kaliteli ürünleri ve profesyonel hizmetleri sunmaktan gurur duyuyoruz.

2014 yılından beri faaliyet gösteren firmamız, başlangıçta küçük bir atölye olarak hizmet vermeye başladı. Zaman içinde müşteri memnuniyeti ve kalite odaklı yaklaşımımız sayesinde, sektörün önde gelen isimlerinden biri haline geldik.

Bugün, geniş ürün yelpazemiz ve uzman ekibimizle, araç sahiplerinin hayallerindeki performans ve görünüme ulaşmalarına yardımcı oluyoruz. Her projede mükemmellik hedefliyor, müşterilerimizin güvenini kazanmak için çalışıyoruz.`

const DEFAULT_VALUES: AboutValueItem[] = [
  { title: 'Misyonumuz', description: 'Müşterilerimize en kaliteli tuning ürünleri ve hizmetlerini sunarak, araçlarının performansını ve görünümünü en üst seviyeye çıkarmak.', icon: 'Target' },
  { title: 'Vizyonumuz', description: 'Türkiye\'nin önde gelen tuning merkezi olmak ve sektörde kalite standartlarını belirlemek.', icon: 'Heart' },
  { title: 'Kalite', description: 'Tüm ürün ve hizmetlerimizde en yüksek kalite standartlarını koruyor, müşteri memnuniyetini ön planda tutuyoruz.', icon: 'Award' },
  { title: 'Uzman Ekip', description: 'Yılların deneyimine sahip uzman ekibimizle, her projede mükemmellik hedefliyoruz.', icon: 'Users' },
]

const DEFAULT_WHY_CHOOSE_US: AboutValueItem[] = [
  { title: 'Geniş Ürün Yelpazesi', description: 'Tuning dünyasının en kaliteli markalarını bünyemizde bulunduruyoruz.', icon: 'Package' },
  { title: 'Uzman Ekip', description: 'Yılların deneyimine sahip teknik ekibimizle her projede mükemmellik hedefliyoruz.', icon: 'Users' },
  { title: 'Kalite Garantisi', description: 'Tüm ürün ve hizmetlerimizde kalite garantisi sunuyoruz.', icon: 'ShieldCheck' },
  { title: 'Müşteri Odaklı Hizmet', description: 'Her müşterimizin ihtiyacına özel çözümler üretiyor, memnuniyeti ön planda tutuyoruz.', icon: 'Heart' },
  { title: 'Rekabetçi Fiyatlar', description: 'Kaliteli ürün ve hizmetleri uygun fiyatlarla sunuyoruz.', icon: 'Award' },
]

export default function HakkimizdaPage() {
  const [aboutText, setAboutText] = useState<string | null>(null)
  const [aboutValues, setAboutValues] = useState<AboutValueItem[]>([])
  const [whyChooseUs, setWhyChooseUs] = useState<AboutValueItem[]>([])

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        setAboutText(s?.aboutPageText?.trim() ?? '')
        const values = s?.aboutValues
        setAboutValues(Array.isArray(values) && values.length > 0 ? values : DEFAULT_VALUES)
        const why = s?.whyChooseUs
        setWhyChooseUs(Array.isArray(why) && why.length > 0 ? why : DEFAULT_WHY_CHOOSE_US)
      })
      .catch(() => {
        setAboutText('')
        setAboutValues(DEFAULT_VALUES)
        setWhyChooseUs(DEFAULT_WHY_CHOOSE_US)
      })
  }, [])

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

      {/* Hikayemiz (admin Ayarlar’dan düzenlenebilir) */}
      <section className="dark-section py-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
              Hikayemiz
            </h2>
            {aboutText === null ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-gray-300 space-y-4 [&_p]:text-gray-300">
                {(aboutText || DEFAULT_ABOUT).split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Değerlerimiz (premium, admin-editable) */}
      <section className="dark-section py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-content relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Değerlerimiz
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Çalışma prensiplerimiz ve değerlerimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {aboutValues.map((value, index) => (
              <div key={index} className="group rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-bold text-white tracking-tight mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
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

      {/* Neden Bizi Seçmelisiniz (premium, admin-editable) */}
      <section className="dark-section py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-content relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Güvenilir çözüm ortağınız olmak için neler sunuyoruz
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="group rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 shrink-0">
                    <IconFromName name={item.icon} className="w-4 h-4 text-white" size={16} />
                  </div>
                  <h3 className="font-semibold text-white tracking-tight text-sm md:text-base">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
