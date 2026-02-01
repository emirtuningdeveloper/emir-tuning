'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronLeft, BarChart3, Save, Loader2, ExternalLink } from 'lucide-react'
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore-admin'

export default function AdminAnalitikPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        setGoogleAnalyticsId(s?.seoSettings?.googleAnalyticsId?.trim() ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSaveGa = async () => {
    try {
      setSaving(true)
      setSaveMessage(null)
      const settings = await getSiteSettings()
      await updateSiteSettings({
        ...settings,
        seoSettings: {
          ...settings?.seoSettings,
          googleAnalyticsId: googleAnalyticsId.trim() || undefined,
        },
      })
      setSaveMessage('Google Analytics ayarları kaydedildi.')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (e: unknown) {
      const err = e as { message?: string }
      setSaveMessage('Hata: ' + (err?.message ?? String(e)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Google Analytics */}
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  Google Analytics 4
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Site ziyaretlerini takip etmek için Google Analytics 4 (GA4) Measurement ID&apos;nizi girin.
                  Bu değeri Google Analytics hesabınızdan alabilirsiniz.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Measurement ID (G-XXXXXXXXXX)
                    </label>
                    <input
                      type="text"
                      value={googleAnalyticsId}
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Google Analytics → Yönetim → Veri Akışları → Web akışınız → Ölçüm Kimliği
                    </p>
                  </div>
                  {saveMessage && (
                    <p className={`text-sm ${saveMessage.startsWith('Hata') ? 'text-red-600' : 'text-green-600'}`}>
                      {saveMessage}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveGa}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Kaydet
                  </button>
                </div>
                <a
                  href="https://analytics.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-4"
                >
                  Google Analytics&apos;i aç <ExternalLink className="w-4 h-4" />
                </a>
              </section>

              {/* Bilgi */}
              <section className="bg-gray-50 rounded-lg border p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Nasıl alınır?</h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li><a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">analytics.google.com</a> adresine gidin</li>
                  <li>Yönetim (sol alt) → Veri Akışları</li>
                  <li>Web veri akışınızı seçin (veya yeni oluşturun)</li>
                  <li>Ölçüm Kimliği alanındaki G- ile başlayan kodu kopyalayın</li>
                  <li>Yukarıdaki alana yapıştırıp Kaydet&apos;e tıklayın</li>
                </ol>
              </section>
            </div>
          )}
        </main>
      </div>
    </AdminRoute>
  )
}
