'use client'

import AdminRoute from '@/components/AdminRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSiteSettings, updateSiteSettings } from '@/lib/firestore-admin'
import { SiteSettings } from '@/lib/types'
import { toDirectDriveImageUrl } from '@/lib/drive-logo-url'
import { ChevronLeft, Save, Loader2, Settings } from 'lucide-react'

const defaultForm: Omit<SiteSettings, 'id' | 'updatedAt'> = {
  siteName: '',
  siteDescription: '',
  logoUrl: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  homepageText: '',
  aboutPageText: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
  },
  seoSettings: {
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  },
}

export default function AdminAyarlarPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Omit<SiteSettings, 'id' | 'updatedAt'>>(defaultForm)
  const [activeLogoUrl, setActiveLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/drive/logo')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.found && data?.logo?.publicUrl) setActiveLogoUrl(data.logo.publicUrl)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let mounted = true
    getSiteSettings()
      .then((s) => {
        if (!mounted) return
        if (s) {
          setForm({
            siteName: s.siteName ?? '',
            siteDescription: s.siteDescription ?? '',
            logoUrl: s.logoUrl ?? '',
            contactEmail: s.contactEmail ?? '',
            contactPhone: s.contactPhone ?? '',
            address: s.address ?? '',
            homepageText: s.homepageText ?? '',
            aboutPageText: s.aboutPageText ?? '',
            socialMedia: {
              facebook: s.socialMedia?.facebook ?? '',
              instagram: s.socialMedia?.instagram ?? '',
              twitter: s.socialMedia?.twitter ?? '',
              youtube: s.socialMedia?.youtube ?? '',
            },
            seoSettings: {
              metaTitle: s.seoSettings?.metaTitle ?? '',
              metaDescription: s.seoSettings?.metaDescription ?? '',
              metaKeywords: s.seoSettings?.metaKeywords ?? '',
            },
          })
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const rawLogo = form.logoUrl?.trim() ?? ''
      const logoUrl = toDirectDriveImageUrl(rawLogo)
      console.log('Admin ayarlar: Saving site settings (logoUrl =', rawLogo, '→', logoUrl, ')')
      await updateSiteSettings({
        ...form,
        logoUrl,
        socialMedia: form.socialMedia ?? defaultForm.socialMedia,
        seoSettings: form.seoSettings ?? defaultForm.seoSettings,
      })
      alert('Ayarlar kaydedildi.')
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      console.error('Admin ayarlar: Save failed', err)
      const isPermissionDenied =
        err?.code === 'permission-denied' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('permission'))
      if (isPermissionDenied) {
        console.error('Firestore PERMISSION_DENIED: Site ayarları yazma yetkisi yok. Firebase Console → Firestore → Rules bölümünde siteSettings için write kuralını kontrol edin.')
        alert('Kaydetme hatası: Yetki reddedildi (Firestore). Firebase Console → Firestore → Kurallar\'da siteSettings için yazma iznini kontrol edin.')
      } else {
        alert('Kaydetme hatası: ' + (err?.message ?? String(e)))
      }
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
              <Link
                href="/admin"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="space-y-8">
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Genel
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aktif logo (sitede görünen)</label>
                    <p className="text-xs text-gray-500 mb-2">Google Drive&apos;dan yüklenen mevcut logo:</p>
                    {activeLogoUrl ? (
                      <div className="p-3 bg-gray-50 rounded-lg border inline-block">
                        <img
                          src={`/api/carparts/image?url=${encodeURIComponent(activeLogoUrl)}`}
                          alt="Aktif logo"
                          className="max-h-16 w-auto object-contain"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.onerror = null
                            t.src = activeLogoUrl
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Yükleniyor veya Drive&apos;da logo yok.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site logosu (link)</label>
                    <p className="text-xs text-gray-500 mb-1">Özel logo URL&apos;i (bu alan doluysa ayarlardaki logo kullanılabilir):</p>
                    <input
                      type="url"
                      value={form.logoUrl ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="https://... logo görseli URL"
                    />
                    {(form.logoUrl ?? '').trim() && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                        <p className="text-xs text-gray-500 mb-2">Önizleme:</p>
                        <img
                          src={toDirectDriveImageUrl(form.logoUrl!.trim())}
                          alt="Logo önizleme"
                          className="max-h-16 w-auto object-contain"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site adı</label>
                    <input
                      type="text"
                      value={form.siteName}
                      onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Emir Tuning"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site açıklaması</label>
                    <input
                      type="text"
                      value={form.siteDescription}
                      onChange={(e) => setForm((f) => ({ ...f, siteDescription: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Kısa açıklama"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anasayfa metni</label>
                    <textarea
                      value={form.homepageText}
                      onChange={(e) => setForm((f) => ({ ...f, homepageText: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      placeholder="Anasayfada gösterilecek metin (isteğe bağlı)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hakkımızda metni</label>
                    <textarea
                      value={form.aboutPageText ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, aboutPageText: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={8}
                      placeholder="Hakkımızda sayfasında gösterilecek metin (isteğe bağlı; boş bırakırsanız varsayılan metin gösterilir)"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">İletişim</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="info@emirtuning.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input
                      type="text"
                      value={form.contactPhone}
                      onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="+90 ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                      placeholder="Adres"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sosyal medya</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['facebook', 'instagram', 'twitter', 'youtube'] as const).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                      <input
                        type="url"
                        value={form.socialMedia?.[key] ?? ''}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            socialMedia: { ...f.socialMedia, [key]: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder={`https://${key}.com/...`}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">SEO</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta başlık</label>
                    <input
                      type="text"
                      value={form.seoSettings?.metaTitle ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          seoSettings: { ...f.seoSettings, metaTitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta açıklama</label>
                    <textarea
                      value={form.seoSettings?.metaDescription ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          seoSettings: { ...f.seoSettings, metaDescription: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta anahtar kelimeler</label>
                    <input
                      type="text"
                      value={form.seoSettings?.metaKeywords ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          seoSettings: { ...f.seoSettings, metaKeywords: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="virgülle ayırın"
                    />
                  </div>
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
