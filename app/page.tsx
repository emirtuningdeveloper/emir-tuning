'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Car, Wrench, Sparkles, ArrowRight, Star, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { getApprovedReviews, getActiveAnnouncements, getSiteSettings } from '@/lib/firestore'
import { Review, Announcement, SiteSettings } from '@/lib/types'

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
        <div className="bg-primary-600 text-white py-2 px-4 text-center text-sm">
          <div className="container mx-auto flex items-center justify-center gap-2">
            <span className="font-semibold">{bannerAnnouncement.title}:</span>
            <span>{bannerAnnouncement.content}</span>
          </div>
        </div>
      )}

      {/* Popup Announcement */}
      {showPopup && popupAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{popupAnnouncement.title}</h3>
            <p className="text-gray-600 mb-4">{popupAnnouncement.content}</p>
            <button
              onClick={handleClosePopup}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative text-white py-20 md:py-32 overflow-hidden">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
            filter: 'blur(4px) brightness(0.7)',
            transform: 'scale(1.1)',
          }}
        />
        {/* Overlay for better text readability - daha şeffaf */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-primary-800/50 to-primary-900/50" />

        {/* Logo - Sağ üst köşede */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12 lg:top-16 lg:right-16 z-30">
          <div className="w-72 md:w-96 lg:w-[480px] xl:w-[576px] opacity-100">
            <Logo />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {siteSettings?.siteName || 'Emir Tuning'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {siteSettings?.siteDescription || 'Otomotiv Tuning Dünyasında Profesyonel Çözümler'}
            </p>
            <p className="text-lg text-primary-200 mb-12">
              Araçlarınızı en üst seviyeye taşıyın. Kaliteli ürünler ve uzman hizmetlerimizle
              hayalinizdeki performansı yakalayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/urunler"
                className="bg-white text-primary-900 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
              >
                Ürünlerimiz
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/hizmetler"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-500 transition-colors flex items-center justify-center gap-2"
              >
                Hizmetlerimiz
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden Emir Tuning?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Yılların deneyimi ve kaliteli ürünlerle araçlarınıza değer katıyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Geniş Ürün Yelpazesi</h3>
              <p className="text-gray-600">
                Tuning dünyasının en kaliteli ürünlerini sizlerle buluşturuyoruz
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Profesyonel Hizmet</h3>
              <p className="text-gray-600">
                Uzman ekibimizle araçlarınıza özel çözümler sunuyoruz
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Kalite Garantisi</h3>
              <p className="text-gray-600">
                Her ürün ve hizmetimizde kalite standartlarımızı koruyoruz
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Müşteri Yorumları
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Müşterilerimizin deneyimlerini okuyun
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                      {review.customerEmail && (
                        <p className="text-sm text-gray-500">{review.customerEmail}</p>
                      )}
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hayalinizdeki Aracı Oluşturun
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Ürünlerimizi inceleyin ve hizmetlerimizden yararlanın. Size en uygun çözümü birlikte
            bulalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/urunler"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Ürünleri Keşfet
            </Link>
            <Link
              href="/hizmetler"
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Hizmetleri İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
