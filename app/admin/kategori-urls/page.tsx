'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, Save, X, Loader2, FolderTree } from 'lucide-react'
import { useState, useEffect } from 'react'
import { buildCategoriesFromFlat, getCategoryPathsGrouped } from '@/lib/product-categories'

type ManagedItem = { path: string; title: string }

function titleToSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminKategoriYonetimiPage() {
  const [items, setItems] = useState<ManagedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newPath, setNewPath] = useState('')
  const [newTitle, setNewTitle] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/categories?format=flat')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Yüklenemedi')
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kategoriler yüklenemedi')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const tree = buildCategoriesFromFlat(items)
  const categoryOptions = getCategoryPathsGrouped(tree)
  const selectedItem = selectedPath ? items.find((i) => i.path === selectedPath) : null

  // Seçilen kategori değişince düzenleme alanını güncelle
  useEffect(() => {
    if (selectedItem) {
      setEditTitle(selectedItem.title)
    } else {
      setEditTitle('')
    }
  }, [selectedPath, selectedItem?.title])

  const save = async (newItems: ManagedItem[]) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kaydetme hatası')
      setItems(newItems)
      setShowAdd(false)
      setNewPath('')
      setNewTitle('')
      if (selectedPath && !newItems.some((i) => i.path === selectedPath)) {
        setSelectedPath(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = () => {
    if (!selectedPath || !selectedItem) return
    const t = editTitle.trim()
    if (!t) return
    const next = items.map((i) => (i.path === selectedPath ? { ...i, title: t } : i))
    save(next)
  }

  const handleDelete = () => {
    if (!selectedPath || !selectedItem) return
    if (!confirm(`"${selectedItem.title}" kategorisini listeden kaldırmak istediğinize emin misiniz?`)) return
    const next = items.filter((i) => i.path !== selectedPath)
    save(next)
    setSelectedPath(null)
  }

  const handleAdd = () => {
    const path = (newPath || titleToSlug(newTitle)).trim()
    const title = newTitle.trim()
    if (!path || !title) {
      alert('Path veya başlık boş olamaz.')
      return
    }
    if (items.some((i) => i.path === path)) {
      alert('Bu path zaten var.')
      return
    }
    const next = [...items, { path, title }]
    next.sort((a, b) => a.path.localeCompare(b.path))
    save(next)
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
              <h1 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <p className="text-gray-600 mb-6">
            Kategori seçin, sağda düzenleyin veya yeni kategori ekleyin. Değişiklikler ürünler sayfası ve menüde hemen yansır.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sol: Kategori listesi (ürün yönetimindeki gibi dropdown) */}
              <div className="lg:w-80 shrink-0">
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <FolderTree className="w-4 h-4" />
                      Kategoriler ({items.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdd(true)
                        setSelectedPath(null)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Plus className="w-4 h-4" />
                      Yeni
                    </button>
                  </div>
                  <label className="block text-sm text-gray-600 mb-2">Kategori seçin</label>
                  <select
                    value={selectedPath ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      setSelectedPath(v || null)
                      setShowAdd(false)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="">— Kategori seçin —</option>
                    {categoryOptions.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map((opt) => (
                          <option key={opt.path} value={opt.path}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sağ: Seçilen kategoriyi düzenle veya yeni ekle */}
              <div className="flex-1 min-w-0">
                {showAdd ? (
                  <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Yeni kategori</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Path (URL slug)</label>
                        <input
                          type="text"
                          value={newPath}
                          onChange={(e) => setNewPath(e.target.value)}
                          placeholder="Boş bırakırsanız başlıktan üretilir"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Görünen ad (başlık)</label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Örn. Body Kit Setler"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={handleAdd}
                        disabled={saving || !newTitle.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Ekle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdd(false)
                          setNewPath('')
                          setNewTitle('')
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : selectedItem ? (
                  <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Kategoriyi düzenle</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Path (değiştirilemez)</label>
                        <input
                          type="text"
                          value={selectedItem.path}
                          readOnly
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Görünen ad (başlık)</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={saving || editTitle.trim() === selectedItem.title}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-500">
                    <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Düzenlemek için soldan bir kategori seçin veya &quot;Yeni&quot; ile kategori ekleyin.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminRoute>
  )
}
