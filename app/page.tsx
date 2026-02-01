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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-card-lg max-w-md w-full p-6 relative shadow-dropdown border border-white/10">
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 p-1 rounded-button text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 pr-8 tracking-tight">{popupAnnouncement.title}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">{popupAnnouncement.content}</p>
            <button
              onClick={handleClosePopup}
              className="w-full bg-white text-black px-4 py-3 rounded-button font-semibold hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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

      {/* Neden Emir Tuning – koyu tema */}
      <section className="dark-section py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-content relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Neden Emir Tuning?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
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
                className="group rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-base font-bold text-white tracking-tight mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section - koyu tema */}
      {reviews.length > 0 && (
        <section className="dark-section py-20 md:py-24">
          <div className="container mx-auto px-4 max-w-content relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Müşteri Yorumları
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Müşterilerimizin deneyimlerini okuyun
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">{review.customerName}</h3>
                      {review.customerEmail && (
                        <p className="text-sm text-gray-500 truncate">{review.customerEmail}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 flex-1 min-h-0">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-4 shrink-0">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - koyu tema */}
      <section className="dark-section py-20 md:py-24 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-content text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Hayalinizdeki Aracı Oluşturun
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ürünlerimizi inceleyin ve hizmetlerimizden yararlanın. Size en uygun çözümü birlikte
            bulalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center bg-white text-black px-7 py-3.5 rounded-button font-semibold text-sm hover:bg-gray-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Ürünleri Keşfet
            </Link>
            <Link
              href="/hizmetler"
              className="inline-flex items-center justify-center bg-transparent text-white border border-white/40 px-7 py-3.5 rounded-button font-semibold text-sm hover:bg-white/10 hover:border-white/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Hizmetleri İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
