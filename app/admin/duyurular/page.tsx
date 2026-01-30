'use client'

import AdminRoute from '@/components/AdminRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getAllAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/firestore-admin'
import { Announcement } from '@/lib/types'
import { ChevronLeft, Edit, Trash2, Plus, Save, X, Loader2, Bell } from 'lucide-react'

const typeLabels: Record<'banner' | 'popup', string> = {
  banner: 'Üst şerit (site girişinde ince şerit)',
  popup: 'Popup (anasayfada kapatılabilir pencere)',
}

export default function AdminDuyurularPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'banner' as 'banner' | 'popup',
    isActive: true,
    priority: 'medium' as 'high' | 'medium' | 'low',
    expiresAt: '',
  })

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const list = await getAllAnnouncements()
      setAnnouncements(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const openEdit = (a: Announcement) => {
    setEditing(a)
    setForm({
      title: a.title ?? '',
      content: a.content ?? '',
      type: a.type ?? 'banner',
      isActive: a.isActive ?? true,
      priority: (a.priority as 'high' | 'medium' | 'low') ?? 'medium',
      expiresAt: a.expiresAt
        ? new Date(a.expiresAt).toISOString().slice(0, 16)
        : '',
    })
    setShowAdd(false)
  }

  const openAdd = () => {
    setShowAdd(true)
    setEditing(null)
    setForm({
      title: '',
      content: '',
      type: 'banner',
      isActive: true,
      priority: 'medium',
      expiresAt: '',
    })
  }

  const closeModal = () => {
    setEditing(null)
    setShowAdd(false)
  }

  const handleSave = async () => {
    if (!form.content.trim()) {
      alert('İçerik zorunludur.')
      return
    }
    try {
      setSaving(true)
      const payload = {
        title: form.title.trim() || undefined,
        content: form.content.trim(),
        type: form.type,
        isActive: form.isActive,
        priority: form.priority,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
      }
      if (editing) {
        await updateAnnouncement(editing.id, payload)
      } else {
        await addAnnouncement(payload)
      }
      await loadAnnouncements()
      closeModal()
    } catch (e) {
      console.error(e)
      alert('Kaydetme hatası.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return
    try {
      await deleteAnnouncement(id)
      await loadAnnouncements()
      closeModal()
    } catch (e) {
      console.error(e)
      alert('Silme hatası.')
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
                <h1 className="text-2xl font-bold text-gray-900">Duyurular / Kampanyalar</h1>
              </div>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                Yeni kampanya
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <p className="text-gray-600 mb-6">
            Üst şerit: site girişinde sayfanın üstünde ince şerit olarak gösterilir. Popup: anasayfada
            kapatılabilir pencere olarak açılır.
          </p>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Henüz duyuru yok. &quot;Yeni kampanya&quot; ile ekleyin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-lg border p-4 flex flex-wrap items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{a.title || '(Başlıksız)'}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {typeLabels[a.type ?? 'banner']}
                      </span>
                      {a.isActive !== false && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                          Yayında
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1 line-clamp-2">{a.content}</p>
                    {a.expiresAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Bitiş: {new Date(a.expiresAt).toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
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
                  {editing ? 'Kampanyayı düzenle' : 'Yeni kampanya ekle'}
                </h2>
                <button type="button" onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gösterim türü</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value as 'banner' | 'popup' }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="banner">{typeLabels.banner}</option>
                    <option value="popup">{typeLabels.popup}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık (opsiyonel)</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Kampanya başlığı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İçerik *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Duyuru metni..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priority: e.target.value as 'high' | 'medium' | 'low',
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş tarihi (opsiyonel)</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Yayında (göster)</span>
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
