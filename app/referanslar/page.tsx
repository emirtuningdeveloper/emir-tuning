'use client'

import { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

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
    // Simüle edilmiş referans verileri
    // Gerçek uygulamada bu veriler Firestore'dan çekilebilir
    const mockReferences: Reference[] = [
      {
        id: '1',
        customerName: 'Ahmet Yılmaz',
        vehicleModel: 'BMW 3.20i',
        service: 'Chip Tuning',
        comment: 'Harika bir hizmet aldım. Aracımın performansı gözle görülür şekilde arttı. Profesyonel ekip ve kaliteli işçilik. Kesinlikle tavsiye ederim!',
        rating: 5,
        date: new Date('2024-01-15'),
      },
      {
        id: '2',
        customerName: 'Mehmet Demir',
        vehicleModel: 'Mercedes C200',
        service: 'Egzoz Sistemi',
        comment: 'Egzoz sistemini değiştirdim. Hem ses hem de performans açısından mükemmel sonuç aldım. Çok memnun kaldım.',
        rating: 5,
        date: new Date('2024-02-20'),
      },
      {
        id: '3',
        customerName: 'Ayşe Kaya',
        vehicleModel: 'Audi A3',
        service: 'Body Kit',
        comment: 'Aracıma body kit taktırdım. İşçilik kalitesi çok yüksek, aracımın görünümü tam istediğim gibi oldu. Teşekkürler!',
        rating: 5,
        date: new Date('2024-03-10'),
      },
      {
        id: '4',
        customerName: 'Can Özkan',
        vehicleModel: 'Volkswagen Golf GTI',
        service: 'Fren Sistemi',
        comment: 'Fren sistemini yükselttim. Güvenlik ve performans açısından çok iyi bir yatırım oldu. Profesyonel yaklaşımları için teşekkürler.',
        rating: 5,
        date: new Date('2024-03-25'),
      },
      {
        id: '5',
        customerName: 'Zeynep Arslan',
        vehicleModel: 'Ford Focus ST',
        service: 'Radyatör ve Soğutma',
        comment: 'Soğutma sistemini güçlendirdim. Özellikle sıcak havalarda çok fark ettim. Kaliteli ürün ve hizmet.',
        rating: 4,
        date: new Date('2024-04-05'),
      },
      {
        id: '6',
        customerName: 'Burak Şahin',
        vehicleModel: 'Seat Leon Cupra',
        service: 'Süspansiyon',
        comment: 'Süspansiyon sistemini değiştirdim. Hem konfor hem de yol tutuşu açısından mükemmel. Çok memnunum.',
        rating: 5,
        date: new Date('2024-04-18'),
      },
    ]

    // Simüle edilmiş loading
    setTimeout(() => {
      setReferences(mockReferences)
      setLoading(false)
    }, 500)
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Referanslar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Referanslarımız
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Müşterilerimizin deneyimleri ve memnuniyetleri
        </p>
      </div>

      {references.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            Henüz referans eklenmemiş. Yakında burada olacak!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {references.map((reference) => (
            <div
              key={reference.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Quote className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{reference.customerName}</h3>
                  <p className="text-sm text-gray-600">{reference.vehicleModel}</p>
                  <p className="text-xs text-primary-600 mt-1">{reference.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {renderStars(reference.rating)}
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                "{reference.comment}"
              </p>

              <div className="text-xs text-gray-400 border-t pt-4">
                {reference.date.toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* İstatistikler */}
      <div className="mt-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Müşteri Memnuniyeti
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {references.length}+
              </div>
              <div className="text-primary-100">Mutlu Müşteri</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {references.length > 0
                  ? (
                      references.reduce((sum, ref) => sum + ref.rating, 0) /
                      references.length
                    ).toFixed(1)
                  : '0'}
              </div>
              <div className="text-primary-100">Ortalama Puan</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {references.filter((ref) => ref.rating === 5).length}
              </div>
              <div className="text-primary-100">5 Yıldızlı Değerlendirme</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
