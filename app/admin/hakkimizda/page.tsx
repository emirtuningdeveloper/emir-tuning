'use client'

import AdminRoute from '@/components/AdminRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore-admin'
import { SiteSettings, AboutValueItem } from '@/lib/types'
import { ChevronLeft, Save, Loader2, BookOpen, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'

const ICON_OPTIONS = ['ShieldCheck', 'Wrench', 'Package', 'Boxes', 'Car', 'Sparkles', 'Target', 'Heart', 'Award', 'Users', 'CheckCircle2', 'Star']

const DEFAULT_ABOUT_VALUES: AboutValueItem[] = [
  { title: 'Misyonumuz', description: 'Müşterilerimize en kaliteli tuning ürünleri ve hizmetlerini sunarak, araçlarının performansını ve görünümünü en üst seviyeye çıkarmak.', icon: 'Target' },
  { title: 'Vizyonumuz', description: "Türkiye'nin önde gelen tuning merkezi olmak ve sektörde kalite standartlarını belirlemek.", icon: 'Heart' },
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

export default function AdminHakkimizdaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openDegerlerimiz, setOpenDegerlerimiz] = useState(false)
  const [openNedenBizi, setOpenNedenBizi] = useState(false)
  const [aboutPageText, setAboutPageText] = useState('')
  const [aboutValues, setAboutValues] = useState<AboutValueItem[]>([])
  const [whyChooseUs, setWhyChooseUs] = useState<AboutValueItem[]>([])
  const [fullSettings, setFullSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    let mounted = true
    getSiteSettings()
      .then((s) => {
        if (!mounted) return
        setFullSettings(s)
        setAboutPageText(s.aboutPageText ?? '')
        setAboutValues(Array.isArray(s.aboutValues) && s.aboutValues.length > 0 ? s.aboutValues : DEFAULT_ABOUT_VALUES)
        setWhyChooseUs(Array.isArray(s.whyChooseUs) && s.whyChooseUs.length > 0 ? s.whyChooseUs : DEFAULT_WHY_CHOOSE_US)
      })
      .catch(console.error)
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const handleSave = async () => {
    if (!fullSettings) return
    try {
      setSaving(true)
      const payload: Omit<SiteSettings, 'id' | 'updatedAt'> = {
        ...fullSettings,
        aboutPageText,
        aboutValues,
        whyChooseUs,
      }
      await updateSiteSettings(payload)
      setFullSettings((prev) => prev ? { ...prev, ...payload } : null)
      alert('Hakkımızda ayarları kaydedildi.')
    } catch (e: unknown) {
      const err = e as { message?: string }
      alert('Kaydetme hatası: ' + (err?.message ?? String(e)))
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
              <Link href="/admin" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-5 h-5" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Hakkımızda</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Hakkımızda metni
                </h2>
                <p className="text-sm text-gray-500 mb-4">Hakkımızda sayfasındaki &quot;Hikayemiz&quot; bölümünde gösterilir.</p>
                <textarea
                  value={aboutPageText}
                  onChange={(e) => setAboutPageText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900"
                  rows={8}
                  placeholder="Hakkımızda sayfasında gösterilecek metin (isteğe bağlı)"
                />
              </section>

              {/* Değerlerimiz – tıklayınca açılır */}
              <section className="bg-white rounded-lg border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenDegerlerimiz((o) => !o)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900">Değerlerimiz</span>
                  {openDegerlerimiz ? (
                    <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                </button>
                {openDegerlerimiz && (
                  <div className="border-t px-6 pb-6 pt-4 space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Hakkımızda sayfasındaki &quot;Değerlerimiz&quot; kartları. Anasayfadaki &quot;Neden Emir Tuning?&quot; ilk 3 öğeyi kullanır.
                    </p>
                    {aboutValues.map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Öğe {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setAboutValues((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-600 hover:text-red-700 p-1"
                            aria-label="Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const next = [...aboutValues]
                            next[idx] = { ...next[idx], title: e.target.value }
                            setAboutValues(next)
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-900"
                          placeholder="Başlık"
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) => {
                            const next = [...aboutValues]
                            next[idx] = { ...next[idx], description: e.target.value }
                            setAboutValues(next)
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-900"
                          rows={2}
                          placeholder="Açıklama"
                        />
                        <select
                          value={item.icon}
                          onChange={(e) => {
                            const next = [...aboutValues]
                            next[idx] = { ...next[idx], icon: e.target.value }
                            setAboutValues(next)
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-900"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAboutValues((prev) => [...prev, { title: '', description: '', icon: 'Target' }])}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Plus className="w-4 h-4" /> Öğe ekle
                    </button>
                  </div>
                )}
              </section>

              {/* Neden Bizi Seçmelisiniz – tıklayınca açılır */}
              <section className="bg-white rounded-lg border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenNedenBizi((o) => !o)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900">Neden Bizi Seçmelisiniz</span>
                  {openNedenBizi ? (
                    <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                </button>
                {openNedenBizi && (
                  <div className="border-t px-6 pb-6 pt-4 space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Hakkımızda sayfasındaki &quot;Neden Bizi Seçmelisiniz?&quot; öğeleri.
                    </p>
                    {whyChooseUs.map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Öğe {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setWhyChooseUs((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-600 hover:text-red-700 p-1"
                            aria-label="Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const next = [...whyChooseUs]
                            next[idx] = { ...next[idx], title: e.target.value }
                            setWhyChooseUs(next)
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-900"
                          placeholder="Başlık"
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) => {
                            const next = [...whyChooseUs]
                            next[idx] = { ...next[idx], description: e.target.value }
                            setWhyChooseUs(next)
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-900"
                          rows={2}
                          placeholder="Açıklama"
                        />
                        <select
                          value={item.icon}
                          onChange={(e) => {
                            const next = [...whyChooseUs]
                            next[idx] = { ...next[idx], icon: e.target.value }
                            setWhyChooseUs(next)
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-900"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWhyChooseUs((prev) => [...prev, { title: '', description: '', icon: 'CheckCircle2' }])}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Plus className="w-4 h-4" /> Öğe ekle
                    </button>
                  </div>
                )}
              </section>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminRoute>
  )
}
