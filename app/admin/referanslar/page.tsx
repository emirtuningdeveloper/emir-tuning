'use client'

import AdminRoute from '@/components/AdminRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllReviews, addReview, updateReview, deleteReview } from '@/lib/firestore-admin'
import { Review } from '@/lib/types'
import { ChevronLeft, Edit, Trash2, Plus, Save, X, Loader2, MessageSquare, Database } from 'lucide-react'

const SAMPLE_REVIEWS: Omit<Review, 'id' | 'createdAt'>[] = [
  { customerName: 'Ahmet Yılmaz', vehicleModel: 'BMW 3.20i', service: 'Chip Tuning', comment: 'Harika bir hizmet aldım. Aracımın performansı gözle görülür şekilde arttı. Profesyonel ekip ve kaliteli işçilik. Kesinlikle tavsiye ederim!', rating: 5, isApproved: true },
  { customerName: 'Mehmet Demir', vehicleModel: 'Mercedes C200', service: 'Egzoz Sistemi', comment: 'Egzoz sistemini değiştirdim. Hem ses hem de performans açısından mükemmel sonuç aldım. Çok memnun kaldım.', rating: 5, isApproved: true },
  { customerName: 'Ayşe Kaya', vehicleModel: 'Audi A3', service: 'Body Kit', comment: 'Aracıma body kit taktırdım. İşçilik kalitesi çok yüksek, aracımın görünümü tam istediğim gibi oldu. Teşekkürler!', rating: 5, isApproved: true },
  { customerName: 'Can Özkan', vehicleModel: 'Volkswagen Golf GTI', service: 'Fren Sistemi', comment: 'Fren sistemini yükselttim. Güvenlik ve performans açısından çok iyi bir yatırım oldu. Profesyonel yaklaşımları için teşekkürler.', rating: 5, isApproved: true },
  { customerName: 'Zeynep Arslan', vehicleModel: 'Ford Focus ST', service: 'Radyatör ve Soğutma', comment: 'Soğutma sistemini güçlendirdim. Özellikle sıcak havalarda çok fark ettim. Kaliteli ürün ve hizmet.', rating: 4, isApproved: true },
  { customerName: 'Burak Şahin', vehicleModel: 'Seat Leon Cupra', service: 'Süspansiyon', comment: 'Süspansiyon sistemini değiştirdim. Hem konfor hem de yol tutuşu açısından mükemmel. Çok memnunum.', rating: 5, isApproved: true },
]

export default function AdminReferanslarPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    vehicleModel: '',
    service: '',
    comment: '',
    rating: 5,
    imageUrl: '',
    isApproved: true,
  })

  const loadReviews = async () => {
    try {
      setLoading(true)
      const list = await getAllReviews()
      setReviews(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const openEdit = (r: Review) => {
    setEditing(r)
    setForm({
      customerName: r.customerName ?? '',
      vehicleModel: r.vehicleModel ?? '',
      service: r.service ?? '',
      comment: r.comment ?? '',
      rating: r.rating ?? 5,
      imageUrl: r.imageUrl ?? '',
      isApproved: r.isApproved ?? true,
    })
    setShowAdd(false)
  }

  const openAdd = () => {
    setShowAdd(true)
    setEditing(null)
    setForm({
      customerName: '',
      vehicleModel: '',
      service: '',
      comment: '',
      rating: 5,
      imageUrl: '',
      isApproved: true,
    })
  }

  const closeModal = () => {
    setEditing(null)
    setShowAdd(false)
  }

  const handleSave = async () => {
    if (!form.customerName.trim() || !form.comment.trim()) {
      alert('Müşteri adı ve yorum zorunludur.')
      return
    }
    try {
      setSaving(true)
      if (editing) {
        await updateReview(editing.id, {
          customerName: form.customerName.trim(),
          vehicleModel: form.vehicleModel.trim() || undefined,
          service: form.service.trim() || undefined,
          comment: form.comment.trim(),
          rating: Math.min(5, Math.max(1, form.rating)),
          imageUrl: form.imageUrl.trim() || undefined,
          isApproved: form.isApproved,
        })
      } else {
        await addReview({
          customerName: form.customerName.trim(),
          vehicleModel: form.vehicleModel.trim() || undefined,
          service: form.service.trim() || undefined,
          comment: form.comment.trim(),
          rating: Math.min(5, Math.max(1, form.rating)),
          imageUrl: form.imageUrl.trim() || undefined,
          isApproved: form.isApproved,
        })
      }
      await loadReviews()
      closeModal()
    } catch (e) {
      console.error(e)
      alert('Kaydetme hatası.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu referansı silmek istediğinize emin misiniz?')) return
    try {
      await deleteReview(id)
      await loadReviews()
      closeModal()
    } catch (e) {
      console.error(e)
      alert('Silme hatası.')
    }
  }

  const handleSeedSamples = async () => {
    if (!confirm('Örnek 6 müşteri yorumu eklenecek. Devam edilsin mi?')) return
    try {
      setSeeding(true)
      for (const r of SAMPLE_REVIEWS) {
        await addReview(r)
      }
      await loadReviews()
      alert('Örnek referanslar eklendi. Düzenleyebilir veya silebilirsiniz.')
    } catch (e) {
      console.error(e)
      alert('Eklenirken hata oluştu.')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Geri
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Referanslar / Yorumlar</h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSeedSamples}
                  disabled={seeding || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  Örnek referanslar ekle
                </button>
                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Referans
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Henüz referans yok. &quot;Yeni Referans&quot; ile ekleyin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-lg border p-4 flex flex-wrap items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{r.customerName}</div>
                    {(r.vehicleModel || r.service) && (
                      <div className="text-sm text-gray-600 mt-1">
                        {[r.vehicleModel, r.service].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    <p className="text-gray-600 mt-2 line-clamp-2">{r.comment}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">
                        {r.rating}/5 · {r.isApproved ? 'Yayında' : 'Beklemede'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Edit / Add Modal */}
        {(editing || showAdd) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {editing ? 'Referansı düzenle' : 'Yeni referans ekle'}
                </h2>
                <button type="button" onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri adı *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Araç modeli</label>
                  <input
                    type="text"
                    value={form.vehicleModel}
                    onChange={(e) => setForm((f) => ({ ...f, vehicleModel: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="BMW 3.20i"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hizmet</label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Chip Tuning"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yorum *</label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Yorum metni..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puan (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: parseInt(e.target.value, 10) || 5 }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isApproved}
                    onChange={(e) => setForm((f) => ({ ...f, isApproved: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Yayında (referanslar sayfasında görünsün)</span>
                </label>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  )
}
