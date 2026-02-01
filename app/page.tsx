'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Star, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { getApprovedReviews, getActiveAnnouncements, getSiteSettings } from '@/lib/firestore'
import { Review, Announcement, SiteSettings, AboutValueItem } from '@/lib/types'

/** Anasayfa "Neden Emir Tuning" varsayılan 3 öğe (admin'de Değerlerimiz ile düzenlenir, ikon gösterilmez) */
const DEFAULT_HOMEPAGE_WHY: AboutValueItem[] = [
  { title: 'Geniş Ürün Yelpazesi', description: 'Tuning dünyasının en kaliteli ürünlerini sizlerle buluşturuyoruz', icon: 'Package' },
  { title: 'Profesyonel Hizmet', description: 'Uzman ekibimizle araçlarınıza özel çözümler sunuyoruz', icon: 'Users' },
  { title: 'Kalite Garantisi', description: 'Her ürün ve hizmetimizde kalite standartlarımızı koruyoruz', icon: 'ShieldCheck' },
]

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [bannerAnnouncement, setBannerAnnouncement] = useState<Announcement | null>(null)
  const [popupAnnouncement, setPopupAnnouncement] = useState<Announcement | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Popup duyurusu varsa göster
    if (popupAnnouncement && typeof window !== 'undefined') {
      const hasSeenPopup = localStorage.getItem(`popup-seen-${popupAnnouncement.id}`)
      if (!hasSeenPopup) {
        setShowPopup(true)
      }
    }
  }, [popupAnnouncement])

  const loadData = async () => {
    try {
      const [reviewsData, announcementsData, settings] = await Promise.all([
        getApprovedReviews(6), // İlk 6 onaylanmış yorum
        getActiveAnnouncements(),
        getSiteSettings(),
      ])

      setReviews(reviewsData)
      setSiteSettings(settings)

      // Banner ve popup duyurularını ayır
      const banner = announcementsData.find(a => a.type === 'banner')
      const popup = announcementsData.find(a => a.type === 'popup')

      if (banner) setBannerAnnouncement(banner)
      if (popup) setPopupAnnouncement(popup)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleClosePopup = () => {
    setShowPopup(false)
    if (popupAnnouncement) {
      localStorage.setItem(`popup-seen-${popupAnnouncement.id}`, 'true')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Banner Announcement */}
      {bannerAnnouncement && (
        <div className="bg-primary-600 text-white py-2.5 px-4 text-center text-sm">
          <div className="container mx-auto max-w-content flex items-center justify-center gap-2">
            <span className="font-semibold">{bannerAnnouncement.title}:</span>
            <span className="opacity-95">{bannerAnnouncement.content}</span>
          </div>
        </div>
      )}

      {/* Popup Announcement */}
      {showPopup && popupAnnouncement && (
        <div className="fixed inset-0 bg-anthracite-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card-lg max-w-md w-full p-6 relative shadow-dropdown border border-gray-100">
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 p-1 rounded-button text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8 tracking-tight">{popupAnnouncement.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{popupAnnouncement.content}</p>
            <button
              onClick={handleClosePopup}
              className="w-full bg-primary-600 text-white px-4 py-3 rounded-button font-semibold hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative text-white py-24 md:py-36 overflow-hidden">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
            filter: 'blur(5px) brightness(0.55)',
            transform: 'scale(1.08)',
          }}
        />
        {/* Premium overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-anthracite-900/75 via-primary-900/40 to-anthracite-900/80" />

        <div className="container mx-auto px-4 relative z-10 max-w-content">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="w-[min(90vw,300px)] md:w-[380px] lg:w-[440px] opacity-100 drop-shadow-lg">
                <Logo />
              </div>
            </div>
            <p className="text-lg md:text-xl mb-6 text-white/95 font-medium tracking-head">
              {siteSettings?.siteDescription || 'Otomotiv Tuning Dünyasında Profesyonel Çözümler'}
            </p>
            <p className="text-base md:text-lg text-white/80 mb-12 leading-relaxed max-w-xl mx-auto">
              Araçlarınızı en üst seviyeye taşıyın. Kaliteli ürünler ve uzman hizmetlerimizle
              hayalinizdeki performansı yakalayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/urunler"
                className="inline-flex items-center justify-center gap-2 bg-white text-anthracite-900 px-7 py-3.5 rounded-button font-semibold text-sm shadow-card hover:shadow-card-hover hover:bg-gray-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite-900"
              >
                Ürünlerimiz
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/hizmetler"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-7 py-3.5 rounded-button font-semibold text-sm border border-primary-500/50 shadow-soft hover:bg-primary-700 hover:border-primary-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite-900"
              >
                Hizmetlerimiz
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-anthracite-900 z-20" aria-hidden="true" />
      </section>

      {/* Neden Emir Tuning – sade, ikonsuz, admin'den düzenlenebilir (Değerlerimiz ilk 3 öğe) */}
      <section className="py-20 md:py-28 bg-[#f7f6f4]">
        <div className="container mx-auto px-4 max-w-content">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-anthracite-900 mb-4 tracking-tight">
              Neden Emir Tuning?
            </h2>
            <p className="text-lg text-anthracite-600 max-w-2xl mx-auto leading-relaxed">
              Yılların deneyimi ve kaliteli ürünlerle araçlarınıza değer katıyoruz
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {(Array.isArray(siteSettings?.aboutValues) && siteSettings.aboutValues.length > 0
              ? siteSettings.aboutValues.slice(0, 3)
              : DEFAULT_HOMEPAGE_WHY
            ).map((item, index) => (
              <div
                key={index}
                className="group rounded-xl bg-anthracite-700 p-2 md:p-2.5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="bg-white rounded-lg overflow-hidden h-[260px] flex flex-col text-center">
                  <div className="bg-anthracite-800 px-4 py-3.5 shrink-0">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <div className="p-6 flex-1 flex items-center justify-center min-h-0">
                    <p className="text-anthracite-600 text-sm leading-relaxed line-clamp-4">
                      {item.description}
                    </p>
                  </div>
                  <div className="h-2 bg-anthracite-800 shrink-0" aria-hidden />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-24 bg-[var(--section-bg)]">
          <div className="container mx-auto px-4 max-w-content">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                Müşteri Yorumları
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Müşterilerimizin deneyimlerini okuyun
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl bg-anthracite-700 p-2 md:p-2.5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="bg-white rounded-lg overflow-hidden p-6 flex flex-col h-[300px]">
                    <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{review.customerName}</h3>
                        {review.customerEmail && (
                          <p className="text-sm text-gray-500 truncate">{review.customerEmail}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 flex-1 min-h-0">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-4 shrink-0">
                      {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    <div className="h-2 bg-anthracite-800 -mx-6 -mb-6 mt-4 rounded-b-lg shrink-0" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-primary-50/80 to-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-content text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Hayalinizdeki Aracı Oluşturun
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ürünlerimizi inceleyin ve hizmetlerimizden yararlanın. Size en uygun çözümü birlikte
            bulalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center bg-primary-600 text-white px-7 py-3.5 rounded-button font-semibold text-sm shadow-soft hover:bg-primary-700 hover:shadow-card transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Ürünleri Keşfet
            </Link>
            <Link
              href="/hizmetler"
              className="inline-flex items-center justify-center bg-white text-primary-600 border-2 border-primary-200 px-7 py-3.5 rounded-button font-semibold text-sm hover:border-primary-400 hover:bg-primary-50/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              Hizmetleri İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
