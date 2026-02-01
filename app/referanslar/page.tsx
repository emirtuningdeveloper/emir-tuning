'use client'

import { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { getApprovedReviews } from '@/lib/firestore'
import BrandLogoCarousel from '@/components/BrandLogoCarousel'

interface Reference {
  id: string
  customerName: string
  vehicleModel: string
  service: string
  comment: string
  rating: number
  imageUrl?: string
  date: Date
}

export default function ReferanslarPage() {
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApprovedReviews()
      .then((reviews) => {
        setReferences(
          reviews.map((r) => ({
            id: r.id,
            customerName: r.customerName ?? '',
            vehicleModel: r.vehicleModel ?? '',
            service: r.service ?? '',
            comment: r.comment ?? '',
            rating: r.rating ?? 5,
            imageUrl: r.imageUrl,
            date: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
          }))
        )
      })
      .catch(() => setReferences([]))
      .finally(() => setLoading(false))
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-amber-500 fill-amber-500' : 'text-white/20'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="dark-section min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-content relative z-10">
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Referanslar yükleniyor...</p>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dark-section min-h-screen">
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-content relative z-10">
      <div className="text-center mb-10 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
          Referanslarımız
        </h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto">
          Müşterilerimizin deneyimleri ve memnuniyetleri
        </p>
      </div>

      {/* Premium brand logo carousel */}
      <div className="mb-12 md:mb-16">
        <BrandLogoCarousel />
      </div>

      {/* Customer reviews – smaller, premium cards */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 tracking-tight text-center">
          Müşteri Yorumları
        </h2>
        {references.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-gray-400 text-sm">
              Henüz referans eklenmemiş. Yakında burada olacak!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
            {references.map((reference) => (
              <div
                key={reference.id}
                className="bg-white/5 rounded-xl border border-white/10 p-4 md:p-5 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Quote className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm tracking-tight">
                      {reference.customerName}
                    </h3>
                    {reference.vehicleModel && (
                      <p className="text-xs text-gray-500 mt-0.5">{reference.vehicleModel}</p>
                    )}
                    {reference.service && (
                      <p className="text-xs text-primary-400 mt-0.5">{reference.service}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {renderStars(reference.rating)}
                  <span className="text-xs text-gray-500 ml-1">
                    {reference.rating}/5
                  </span>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                  &quot;{reference.comment}&quot;
                </p>

                <div className="text-xs text-gray-500 border-t border-white/10 pt-3 mt-3">
                  {reference.date.toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* İstatistikler */}
      <div className="mt-12 md:mt-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl p-6 md:p-10 border border-primary-500/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center tracking-tight">
            Müşteri Memnuniyeti
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {references.length}+
              </div>
              <div className="text-primary-100 text-sm">Mutlu Müşteri</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {references.length > 0
                  ? (
                      references.reduce((sum, ref) => sum + ref.rating, 0) /
                      references.length
                    ).toFixed(1)
                  : '0'}
              </div>
              <div className="text-primary-100 text-sm">Ortalama Puan</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {references.filter((ref) => ref.rating === 5).length}
              </div>
              <div className="text-primary-100 text-sm">5 Yıldızlı Değerlendirme</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
