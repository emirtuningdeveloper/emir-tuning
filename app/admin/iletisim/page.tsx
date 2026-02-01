'use client'

import AdminRoute from '@/components/AdminRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore-admin'
import { SiteSettings } from '@/lib/types'
import { ChevronLeft, Save, Loader2, Mail, Phone, MapPin, Share2 } from 'lucide-react'

const defaultSocial = {
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
}

export default function AdminIletisimPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [address, setAddress] = useState('')
  const [workingHours, setWorkingHours] = useState('')
  const [socialMedia, setSocialMedia] = useState(defaultSocial)
  const [fullSettings, setFullSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    let mounted = true
    getSiteSettings()
      .then((s) => {
        if (!mounted) return
        setFullSettings(s)
        setContactEmail(s.contactEmail ?? '')
        setContactPhone(s.contactPhone ?? '')
        setWhatsappPhone(s.whatsappPhone ?? '')
        setAddress(s.address ?? '')
        setWorkingHours(s.workingHours ?? '')
        setSocialMedia({
          facebook: s.socialMedia?.facebook ?? '',
          instagram: s.socialMedia?.instagram ?? '',
          twitter: s.socialMedia?.twitter ?? '',
          youtube: s.socialMedia?.youtube ?? '',
        })
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
        contactEmail,
        contactPhone,
        whatsappPhone,
        address,
        workingHours: workingHours || undefined,
        socialMedia,
      }
      await updateSiteSettings(payload)
      setFullSettings((prev) => prev ? { ...prev, ...payload } : null)
      alert('İletişim bilgileri kaydedildi.')
    } catch (e: unknown) {
      const err = e as { message?: string }
      alert('Kaydetme hatası: ' + (err?.message ?? String(e)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-5 h-5" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">İletişim & Sosyal Medya</h1>
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
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  İletişim Bilgileri
                </h2>
                <p className="text-sm text-gray-500 mb-4">Bu bilgiler sitedeki İletişim sayfasında gösterilir.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="info@emirtuning.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="+90 ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp numarası (sağ alttaki buton)</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="+90 545 761 54 94"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      placeholder="Adres"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma saatleri</label>
                    <textarea
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      placeholder={'Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 09:00 - 16:00\nPazar: Kapalı'}
                    />
                    <p className="text-xs text-gray-500 mt-1">İletişim sayfasında &quot;Çalışma Saatleri&quot; bölümünde gösterilir.</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Sosyal medya
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['facebook', 'instagram', 'twitter', 'youtube'] as const).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                      <input
                        type="url"
                        value={socialMedia[key]}
                        onChange={(e) => setSocialMedia((s) => ({ ...s, [key]: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder={`https://${key}.com/...`}
                      />
                    </div>
                  ))}
                </div>
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
