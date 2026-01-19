'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simüle edilmiş form gönderimi
    // Gerçek uygulamada burada bir API endpoint'ine istek gönderilir
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          İletişim
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Sorularınız, önerileriniz veya talepleriniz için bizimle iletişime geçin
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* İletişim Bilgileri */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Adres</h3>
                <p className="text-gray-600">
                  Tuning Merkezi<br />
                  İstanbul, Türkiye
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Telefon</h3>
                <p className="text-gray-600">
                  +90 (XXX) XXX XX XX
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">E-posta</h3>
                <p className="text-gray-600">
                  info@emirtuning.com
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Çalışma Saatleri</h3>
            <div className="space-y-1 text-gray-600">
              <p>Pazartesi - Cuma: 09:00 - 18:00</p>
              <p>Cumartesi: 09:00 - 16:00</p>
              <p>Pazar: Kapalı</p>
            </div>
          </div>
        </div>

        {/* İletişim Formu */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bize Ulaşın</h2>
          
          {isSubmitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">Mesajınız başarıyla gönderildi!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Konu *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Konu seçiniz</option>
                <option value="urun">Ürün Hakkında</option>
                <option value="hizmet">Hizmet Hakkında</option>
                <option value="fiyat">Fiyat Bilgisi</option>
                <option value="randevu">Randevu</option>
                <option value="diger">Diğer</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mesajınız *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gönder
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
