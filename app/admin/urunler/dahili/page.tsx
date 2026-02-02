'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { ChevronLeft, Package, Loader2, Search, Pencil, X, Save } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { buildCategoriesFromFlat, getCategoryPathsGrouped } from '@/lib/product-categories'
import { getProxiedImageUrl } from '@/lib/image-proxy'

type ByCategoryProduct = { id: string; name: string; imageUrl: string; productUrl?: string }

type OverrideMap = Record<string, { name?: string; imageUrl?: string }>

export default function DahiliUrunYonetimiPage() {
  const [categoryItems, setCategoryItems] = useState<{ path: string; title: string }[]>([])
  const [categoryOptions, setCategoryOptions] = useState<{ group: string; options: { path: string; label: string }[] }[]>([])
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('')
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [products, setProducts] = useState<ByCategoryProduct[]>([])
  const [source, setSource] = useState<string>('DRS Tuning')
  const [error, setError] = useState<string | null>(null)
  const [categorySearch, setCategorySearch] = useState('')
  const [outOfStockIds, setOutOfStockIds] = useState<Set<string>>(new Set())
  const [togglingStock, setTogglingStock] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<OverrideMap>({})
  const [editingProduct, setEditingProduct] = useState<ByCategoryProduct | null>(null)
  const [editName, setEditName] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kategoriler yüklenemedi')
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const loadOutOfStock = async () => {
    try {
      const res = await fetch('/api/products/out-of-stock-ids')
      const data = await res.json()
      const ids = Array.isArray(data.ids) ? data.ids : []
      setOutOfStockIds(new Set(ids))
    } catch {
      setOutOfStockIds(new Set())
    }
  }

  const loadOverrides = async () => {
    try {
      const res = await fetch('/api/admin/products/overrides')
      const data = await res.json()
      if (!data.success || !Array.isArray(data.overrides)) return
      const map: OverrideMap = {}
      for (const o of data.overrides) {
        if (o.productId) {
          map[o.productId] = {}
          if (o.name != null) map[o.productId].name = o.name
          if (o.imageUrl != null) map[o.productId].imageUrl = o.imageUrl
        }
      }
      setOverrides(map)
    } catch {
      setOverrides({})
    }
  }

  useEffect(() => {
    loadOutOfStock()
  }, [])

  useEffect(() => {
    loadOverrides()
  }, [])

  const handleFetchProducts = async () => {
    if (!selectedCategoryPath) {
      setError('Önce bir kategori seçin.')
      return
    }
    setLoadingProducts(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/products/by-category?categoryPath=${encodeURIComponent(selectedCategoryPath)}&allPages=true`
      )
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Ürünler çekilemedi')
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ürünler çekilemedi')
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const toggleOutOfStock = async (productId: string) => {
    setTogglingStock(productId)
    try {
      const isOut = outOfStockIds.has(productId)
      await fetch('/api/admin/products/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, outOfStock: !isOut }),
      })
      setOutOfStockIds((prev) => {
        const next = new Set(prev)
        if (next.has(productId)) next.delete(productId)
        else next.add(productId)
        return next
      })
    } finally {
      setTogglingStock(null)
    }
  }

  const openEdit = (p: ByCategoryProduct) => {
    setEditingProduct(p)
    setEditName(overrides[p.id]?.name ?? p.name)
    setEditImageUrl(overrides[p.id]?.imageUrl ?? p.imageUrl ?? '')
  }

  const closeEdit = () => {
    setEditingProduct(null)
    setEditName('')
    setEditImageUrl('')
  }

  const saveEdit = async () => {
    if (!editingProduct) return
    setSavingEdit(true)
    try {
      const res = await fetch('/api/admin/products/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingProduct.id,
          name: editName.trim() || undefined,
          imageUrl: editImageUrl.trim() || undefined,
          outOfStock: outOfStockIds.has(editingProduct.id),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Kaydedilemedi')
      setOverrides((prev) => ({
        ...prev,
        [editingProduct.id]: {
          name: editName.trim() || undefined,
          imageUrl: editImageUrl.trim() || undefined,
        },
      }))
      closeEdit()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Kaydedilemedi')
    } finally {
      setSavingEdit(false)
    }
  }

  const selectedCategoryLabel = selectedCategoryPath
    ? categoryOptions.flatMap((g) => g.options).find((o) => o.path === selectedCategoryPath)?.label || selectedCategoryPath
    : ''

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/admin/urunler"
            className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Ürün Yönetimine dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package className="w-8 h-8 text-primary-600" />
            Dahili Ürün Yönetimi
          </h1>
          <p className="text-gray-600 mb-8">
            Kategori filtresi, kaynak ve kategorideki ürünleri çek.
          </p>

          {/* Kategori Filtresi + Kaynak */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategori ve Kaynak</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Filtresi</label>
                <div className="space-y-1">
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
              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak</label>
                <div className="rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700">
                  {source}
                </div>
              </div>
              <button
                onClick={handleFetchProducts}
                disabled={loadingProducts || !selectedCategoryPath}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProducts ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Çekiliyor...
                  </>
                ) : (
                  'Kategorideki Ürünleri Çek'
                )}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* Ürün listesi */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Ürünler {selectedCategoryLabel ? `(${selectedCategoryLabel})` : ''}
              </h2>
              {products.length > 0 && (
                <span className="text-sm text-gray-500">{products.length} ürün</span>
              )}
            </div>
            {products.length === 0 && !loadingProducts && (
              <div className="p-8 text-center text-gray-500">
                Kategori seçip &quot;Kategorideki Ürünleri Çek&quot; ile listeleyin.
              </div>
            )}
            {products.length > 0 && (
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Görsel</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Ürün adı</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Stok</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700 w-24">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const isOut = outOfStockIds.has(p.id)
                      const displayName = overrides[p.id]?.name ?? p.name
                      const displayImageUrl = overrides[p.id]?.imageUrl ?? p.imageUrl
                      return (
                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="px-4 py-2">
                            {displayImageUrl ? (
                              <img
                                src={getProxiedImageUrl(displayImageUrl)}
                                alt=""
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <a
                              href={p.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline truncate max-w-xs block"
                            >
                              {displayName}
                            </a>
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => toggleOutOfStock(p.id)}
                              disabled={togglingStock === p.id}
                              className={`text-sm px-2 py-1 rounded ${
                                isOut
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } disabled:opacity-50`}
                            >
                              {togglingStock === p.id ? '...' : isOut ? 'Tükendi' : 'Stokta'}
                            </button>
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded hover:bg-primary-50"
                              title="Düzenle"
                            >
                              <Pencil className="w-4 h-4" />
                              Düzenle
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Düzenleme paneli: sol ürün adı, sağda üstte görsel altında görsel linki */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Ürünü düzenle</h3>
                    <button
                      type="button"
                      onClick={closeEdit}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                      aria-label="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ürün adı</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ürün adı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ürün görseli</label>
                      {editImageUrl ? (
                        <img
                          src={getProxiedImageUrl(editImageUrl)}
                          alt="Önizleme"
                          className="w-full aspect-video object-contain bg-gray-100 rounded-lg mb-3 border border-gray-200"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gray-100 rounded-lg mb-3 border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                          Görsel linki girin
                        </div>
                      )}
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ürün görsel linki</label>
                      <input
                        type="url"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeEdit}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={savingEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
