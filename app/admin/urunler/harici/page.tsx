'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { ChevronLeft, Link2, Loader2, CheckSquare, Square, Search } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { buildCategoriesFromFlat, getCategoryPathsGrouped } from '@/lib/product-categories'

type FetchProduct = {
  id: string
  name: string
  imageUrl: string
  productUrl: string
  priceText?: string
  price?: number
}

export default function HariciUrunCekmePage() {
  const [categoryItems, setCategoryItems] = useState<{ path: string; title: string }[]>([])
  const [categoryOptions, setCategoryOptions] = useState<{ group: string; options: { path: string; label: string }[] }[]>([])
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('')
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryPageUrl, setCategoryPageUrl] = useState('')
  const [loadingFetch, setLoadingFetch] = useState(false)
  const [products, setProducts] = useState<FetchProduct[]>([])
  const [editedNames, setEditedNames] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [categorySearch, setCategorySearch] = useState('')

  const filteredCategoryOptions = useMemo(() => {
    const q = categorySearch.trim().toLowerCase()
    if (!q) return categoryOptions
    return categoryOptions
      .map((group) => ({
        ...group,
        options: group.options.filter((opt) => opt.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.options.length > 0)
  }, [categoryOptions, categorySearch])

  const loadCategories = async () => {
    setLoadingCategories(true)
    try {
      const res = await fetch('/api/categories?format=flat')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kategoriler yüklenemedi')
      const items = Array.isArray(data.items) ? data.items : []
      setCategoryItems(items)
      const tree = buildCategoriesFromFlat(items)
      setCategoryOptions(getCategoryPathsGrouped(tree))
      if (!selectedCategoryPath && items.length > 0) {
        const firstPath = items[0]?.path
        if (firstPath) setSelectedCategoryPath(firstPath)
      }
    } catch {
      setCategoryOptions([])
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleFetchPreview = async () => {
    const url = categoryPageUrl.trim()
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setFetchError('Geçerli bir kategori sayfası URL girin.')
      return
    }
    setLoadingFetch(true)
    setFetchError(null)
    setProducts([])
    setEditedNames({})
    setSelectedIds(new Set())
    try {
      const res = await fetch(`/api/products/fetch-from-url?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Ürünler çekilemedi')
      const list = Array.isArray(data.products) ? data.products : []
      setProducts(list)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Ürünler çekilemedi')
      setProducts([])
    } finally {
      setLoadingFetch(false)
    }
  }

  const displayName = (p: FetchProduct) => editedNames[p.id] !== undefined ? editedNames[p.id] : p.name
  const setDisplayName = (id: string, value: string) => {
    setEditedNames((prev) => ({ ...prev, [id]: value }))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size >= products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const handleAddSelected = async () => {
    if (selectedIds.size === 0) {
      alert('En az bir ürün seçin.')
      return
    }
    if (!selectedCategoryPath) {
      alert('Ürün çekilecek kategori seçin.')
      return
    }
    setAdding(true)
    try {
      const toAdd = products
        .filter((p) => selectedIds.has(p.id))
        .map((p) => ({
          name: (editedNames[p.id] !== undefined ? editedNames[p.id] : p.name).trim() || p.name,
          description: (editedNames[p.id] !== undefined ? editedNames[p.id] : p.name).trim() || p.name,
          imageUrl: p.imageUrl || undefined,
        }))
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategoryPath, products: toAdd }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Ürünler eklenemedi')
      alert(`${data.added ?? toAdd.length} ürün Emir Tuning'e eklendi.`)
      setSelectedIds(new Set())
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ürünler eklenemedi')
    } finally {
      setAdding(false)
    }
  }

  const selectedCount = selectedIds.size

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/admin/urunler"
            className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Ürün Yönetimine dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Link2 className="w-8 h-8 text-amber-600" />
            Harici Ürün Çekme
          </h1>
          <p className="text-gray-600 mb-6">
            Link yapıştırıp önce &quot;Test/Ön gösterim için ürünleri çek&quot; ile ürünleri görün, düzenleyin, sonra
            &quot;Seçilen ürünleri Emir Tuning&apos;e ekle&quot; ile kalıcı ekleyin.
          </p>

          {/* Ürün çekilecek kategori */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Çekilecek Kategori</label>
            <div className="max-w-md space-y-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={selectedCategoryPath}
                onChange={(e) => setSelectedCategoryPath(e.target.value)}
                disabled={loadingCategories}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {loadingCategories ? (
                  <option>Yükleniyor...</option>
                ) : filteredCategoryOptions.length === 0 ? (
                  <option value="">Sonuç yok</option>
                ) : (
                  filteredCategoryOptions.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map((opt) => (
                        <option key={opt.path} value={opt.path}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Kategori Sayfası URL + Test/Ön gösterim */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Sayfası URL</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={categoryPageUrl}
                onChange={(e) => setCategoryPageUrl(e.target.value)}
                className="flex-1 min-w-[280px] rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleFetchPreview}
                disabled={loadingFetch}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingFetch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Çekiliyor...
                  </>
                ) : (
                  'Test / Ön gösterim için ürünleri çek'
                )}
              </button>
            </div>
            {fetchError && <p className="mt-2 text-sm text-red-600">{fetchError}</p>}
          </div>

          {/* Ön gösterim + Seçilen ürünleri ekle */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm text-gray-600">
                Ön gösterim: <strong>{selectedCount}</strong> / {products.length} seçili
              </span>
              <button
                onClick={handleAddSelected}
                disabled={adding || selectedCount === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ekleniyor...
                  </>
                ) : (
                  "Seçilen ürünleri Emir Tuning'e ekle"
                )}
              </button>
            </div>
            {products.length === 0 && !loadingFetch && (
              <div className="p-8 text-center text-gray-500">
                Kategori sayfası URL girin ve &quot;Test/Ön gösterim için ürünleri çek&quot; ile listeleyin.
              </div>
            )}
            {products.length > 0 && (
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 w-12">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="p-1 rounded hover:bg-gray-200"
                          aria-label="Tümünü seç / Kaldır"
                        >
                          {selectedIds.size >= products.length ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Görsel</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Ürün adı (düzenlenebilir)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => toggleSelect(p.id)}
                            className="p-1 rounded hover:bg-gray-200"
                            aria-label="Seç"
                          >
                            {selectedIds.has(p.id) ? (
                              <CheckSquare className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={displayName(p)}
                            onChange={(e) => setDisplayName(p.id, e.target.value)}
                            className="w-full min-w-[200px] rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
