'use client'

import AdminRoute from '@/components/AdminRoute'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/lib/firestore'
import { addProduct, updateProduct, updateProductPrice, deleteProduct } from '@/lib/firestore-admin'
import { Product } from '@/lib/types'
import { getCategoryPathsGrouped, getReadableCategoryPath, productCategories } from '@/lib/product-categories'
import { Plus, Edit, Trash2, X, Save, Loader2, Database, RefreshCw, Search, Link2 } from 'lucide-react'

export default function AdminUrunlerPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [buildingIndex, setBuildingIndex] = useState(false)
  const [fetchingCategory, setFetchingCategory] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string>('')
  const [outOfStockIds, setOutOfStockIds] = useState<Set<string>>(new Set())
  const [externalSources, setExternalSources] = useState<Array<{ id: string; url: string; label?: string }>>([])
  const [loadingExternal, setLoadingExternal] = useState(false)
  const [extUrl, setExtUrl] = useState('')
  const [extLabel, setExtLabel] = useState('')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: '',
    features: '',
  })

  const categoryOptions = getCategoryPathsGrouped(productCategories)
  /** Kategori yolunda sadece son kısmı döndür (örn. "A > B > C" → "C") */
  const lastCategoryPart = (pathOrLabel: string) =>
    pathOrLabel && pathOrLabel.includes(' > ') ? pathOrLabel.split(' > ').pop()?.trim() ?? pathOrLabel : pathOrLabel
  /** Kaynak bilgisi: by-category'den gelen source veya id'den çıkarılan */
  const getProductSource = (p: Product) =>
    (p as Product & { source?: string }).source ?? (p.id.startsWith('drstuning_') ? 'DRS Tuning' : 'Index / Firestore')
  /** Kaynak filtresine göre gösterilecek ürünler */
  const displayedProducts =
    selectedSource === 'all' ? products : products.filter((p) => getProductSource(p) === selectedSource)

  /** productUrl veya id'den her ürün için benzersiz id üretir (DRS id çakışmasını önler) */
  function uniqueProductId(p: { id: string; productUrl?: string }, index: number): string {
    if (p.productUrl) {
      let h = 0
      const s = p.productUrl
      for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
      return `drstuning_${(h >>> 0).toString(36)}`
    }
    return `drstuning_${p.id}_${index}`
  }

  const loadStokStatus = async () => {
    try {
      const res = await fetch('/api/admin/products/overrides')
      const data = await res.json()
      if (data.success && Array.isArray(data.overrides)) {
        const ids = new Set(
          data.overrides.filter((o: { outOfStock?: boolean }) => o.outOfStock).map((o: { productId: string }) => o.productId)
        )
        setOutOfStockIds(ids)
      }
    } catch (_) {
      /* ignore */
    }
  }

  const handleToggleStok = async (productId: string) => {
    const next = !outOfStockIds.has(productId)
    try {
      const res = await fetch('/api/admin/products/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, outOfStock: next }),
      })
      const data = await res.json()
      if (data.success) {
        setOutOfStockIds((prev) => {
          const nextSet = new Set(prev)
          if (next) nextSet.add(productId)
          else nextSet.delete(productId)
          return nextSet
        })
      } else {
        alert(data.error || 'Stok durumu güncellenemedi.')
      }
    } catch {
      alert('Stok durumu güncellenirken hata oluştu.')
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/products/index')
        const data = await response.json()
        if (data.success && data.products.length > 0) {
          setProducts(data.products)
          loadStokStatus()
          setLoading(false)
          return
        }
      } catch (indexError) {
        console.warn('Error loading from productSearchIndex:', indexError)
      }
      const data = await getProducts()
      setProducts(data)
      loadStokStatus()
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchByCategory = async () => {
    if (!selectedCategoryPath) {
      alert('Lütfen bir kategori seçin.')
      return
    }
    try {
      setFetchingCategory(true)
      const res = await fetch(
        `/api/products/by-category?categoryPath=${encodeURIComponent(selectedCategoryPath)}`
      )
      const data = await res.json()
      if (!data.success) {
        alert(data.error || 'Ürünler çekilirken hata oluştu.')
        return
      }
      const rawProducts = (data.products || []) as (Product & { source?: string })[]
      setProducts(rawProducts)
      loadStokStatus()
    } catch (e) {
      console.error('Fetch by category:', e)
      alert('Kategoriden ürün çekilirken hata oluştu.')
    } finally {
      setFetchingCategory(false)
    }
  }

  const handleAddProduct = async () => {
    try {
      const features = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : []

      await addProduct({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        features: features.length > 0 ? features : undefined,
      })

      setShowAddModal(false)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Ürün eklenirken bir hata oluştu')
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    const features = formData.features
      ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
      : []

    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      imageUrl: formData.imageUrl || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      features: features.length > 0 ? features : undefined,
    }

    try {
      if (editingProduct.id.startsWith('drstuning_')) {
        await addProduct(payload)
        setProducts((prev) => prev.filter((p) => p.id !== editingProduct.id))
      } else {
        await updateProduct(editingProduct.id, payload)
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
        )
      }
      setEditingProduct(null)
      resetForm()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Ürün kaydedilirken bir hata oluştu')
    }
  }

  const handleUpdatePrice = async (productId: string, newPrice: string) => {
    try {
      const price = parseFloat(newPrice)
      if (isNaN(price)) {
        alert('Geçerli bir fiyat giriniz')
        return
      }
      await updateProductPrice(productId, price)
      loadProducts()
    } catch (error) {
      console.error('Error updating price:', error)
      alert('Fiyat güncellenirken bir hata oluştu')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return

    if (productId.startsWith('drstuning_')) {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      return
    }
    try {
      await deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ürün silinirken bir hata oluştu')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      imageUrl: '',
      price: '',
      features: '',
    })
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl || '',
      price: product.price?.toString() || '',
      features: product.features?.join(', ') || '',
    })
  }

  const handleBuildProductIndex = async () => {
    if (!confirm('Ürün index\'i oluşturmak istediğinize emin misiniz? Bu işlem biraz zaman alabilir.')) return

    try {
      setBuildingIndex(true)
      const response = await fetch('/api/admin/build-product-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearExisting: true }),
      })

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log('Progress:', data)
              
              if (data.type === 'complete') {
                alert(`Index oluşturma tamamlandı! ${data.stats?.total || 0} ürün eklendi.`)
                await loadProducts()
              } else if (data.type === 'error') {
                alert('Hata: ' + data.message)
              }
            } catch (e) {
              console.error('Error parsing progress:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error building index:', error)
      alert('Index oluşturulurken bir hata oluştu')
    } finally {
      setBuildingIndex(false)
    }
  }

  const handleRefresh = () => {
    if (selectedCategoryPath) {
      handleFetchByCategory()
    } else {
      loadProducts()
    }
  }

  const loadExternalSources = async () => {
    if (!selectedCategoryPath) {
      setExternalSources([])
      return
    }
    setLoadingExternal(true)
    try {
      const res = await fetch(
        `/api/admin/category-external-sources?categoryPath=${encodeURIComponent(selectedCategoryPath)}`
      )
      const data = await res.json()
      if (data.success && Array.isArray(data.sources)) {
        setExternalSources(data.sources)
      } else {
        setExternalSources([])
      }
    } catch {
      setExternalSources([])
    } finally {
      setLoadingExternal(false)
    }
  }

  useEffect(() => {
    setSelectedSource('all')
    if (!selectedCategoryPath) {
      setExternalSources([])
      return
    }
    let cancelled = false
    setLoadingExternal(true)
    fetch(
      `/api/admin/category-external-sources?categoryPath=${encodeURIComponent(selectedCategoryPath)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && Array.isArray(data.sources)) {
          setExternalSources(data.sources)
        } else if (!cancelled) {
          setExternalSources([])
        }
      })
      .catch(() => {
        if (!cancelled) setExternalSources([])
      })
      .finally(() => {
        if (!cancelled) setLoadingExternal(false)
      })
    return () => { cancelled = true }
  }, [selectedCategoryPath])

  const handleAddExternalSource = async () => {
    if (!selectedCategoryPath || !extUrl.trim() || !extUrl.startsWith('http')) {
      alert('Lütfen geçerli bir URL girin (http veya https ile başlamalı).')
      return
    }
    try {
      const res = await fetch('/api/admin/category-external-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryPath: selectedCategoryPath,
          url: extUrl.trim(),
          label: extLabel.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setExtUrl('')
        setExtLabel('')
        loadExternalSources()
      } else {
        alert(data.error || 'Eklenemedi.')
      }
    } catch {
      alert('Harici kaynak eklenirken hata oluştu.')
    }
  }

  const handleDeleteExternalSource = async (id: string) => {
    if (!confirm('Bu harici linki kaldırmak istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/admin/category-external-sources?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        loadExternalSources()
      } else {
        alert(data.error || 'Silinemedi.')
      }
    } catch {
      alert('Silinirken hata oluştu.')
    }
  }

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-primary-600 hover:text-primary-700 mb-2"
              >
                ← Geri
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
              <p className="text-gray-600 mt-2">
                İstediğiniz kategoriden ürün çekin, sonra düzenleyin. Her seferinde tüm siteden çekmek zorunda değilsiniz.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Yenile
              </button>
              <button
                onClick={handleBuildProductIndex}
                disabled={buildingIndex}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buildingIndex ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    İndex Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Ürün İndex Oluştur
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Yeni Ürün Ekle
              </button>
            </div>
          </div>

          {/* Kategori & Kaynak filtreleri */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Filtresi</label>
              <select
                value={selectedCategoryPath}
                onChange={(e) => setSelectedCategoryPath(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Tüm Kategoriler</option>
                {categoryOptions.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((opt) => (
                      <option key={opt.path} value={opt.path}>
                        {lastCategoryPart(opt.label)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">Tümü</option>
                <option value="DRS Tuning">DRS Tuning</option>
                {externalSources.map((s) => {
                  const sourceValue = s.label || 'Harici'
                  const sourceLabel = s.label || (() => {
                    try { return new URL(s.url).hostname.replace(/^www\./, '') } catch { return s.url }
                  })()
                  return (
                    <option key={s.id} value={sourceValue}>
                      {sourceLabel}
                    </option>
                  )
                })}
              </select>
            </div>
            <button
              type="button"
              onClick={handleFetchByCategory}
              disabled={!selectedCategoryPath || fetchingCategory}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetchingCategory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Çekiliyor...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Kategoriden Ürün Çek
                </>
              )}
            </button>
          </div>

          {/* Harici kategori kaynakları: Bu kategoriye başka siteden ürün çek */}
          {selectedCategoryPath && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary-600" />
                Harici kategori linki
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                <strong>{lastCategoryPart(getReadableCategoryPath(selectedCategoryPath, productCategories))}</strong>{' '}
                kategorisinde, bu linkteki sayfadan da ürünler çekilir. Örn: başka bir sitedeki aynı kategorideki sayfa
                linkini ekleyin; site açıldığında bu kategorideki ürünlerle birlikte o sitedeki ürünler de listelenir.
              </p>
              <div className="flex flex-wrap gap-2 items-end mb-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kategori sayfası URL</label>
                  <input
                    type="url"
                    value={extUrl}
                    onChange={(e) => setExtUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="min-w-[120px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Etiket (opsiyonel)</label>
                  <input
                    type="text"
                    value={extLabel}
                    onChange={(e) => setExtLabel(e.target.value)}
                    placeholder="Örn: XYZ Mağaza"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddExternalSource}
                  disabled={!extUrl.trim() || !extUrl.startsWith('http')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ekle
                </button>
              </div>
              {loadingExternal ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </div>
              ) : externalSources.length > 0 ? (
                <ul className="space-y-2">
                  {externalSources.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 py-2 px-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        {s.label && <span className="font-medium text-gray-700 mr-2">{s.label}</span>}
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline truncate block"
                        >
                          {s.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExternalSource(s.id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded"
                        title="Kaldır"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Bu kategoriye henüz harici link eklenmemiş.</p>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap sticky right-0 bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.06)] z-10">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          {products.length === 0 ? (
                            <>
                              <p>Kategoriden ürün çekmek için filtreleri kullanın.</p>
                              <p className="text-sm">Kategori seçin ve &quot;Kategoriden Ürün Çek&quot; butonuna tıklayın.</p>
                              <p className="text-xs text-gray-400 mt-2">İsterseniz &quot;Yenile&quot; ile index&apos;teki tüm ürünleri veya &quot;Ürün İndex Oluştur&quot; ile orijinal siteden tüm kategorileri çekebilirsiniz.</p>
                            </>
                          ) : (
                            <p>Bu kaynakta ürün bulunamadı. &quot;Tümü&quot; veya başka bir kaynak seçin.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedProducts.map((product) => (
                      <tr key={product.id} className="group hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 max-w-xs truncate" title={product.name}>{product.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {product.description ? product.description.substring(0, 50) + '...' : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[200px] truncate" title={product.category}>
                          {lastCategoryPart(product.category ?? '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getProductSource(product)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriceEditor
                            productId={product.id}
                            currentPrice={product.price}
                            onUpdate={handleUpdatePrice}
                            readOnly={product.id.startsWith('drstuning_')}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={outOfStockIds.has(product.id)}
                              onChange={() => handleToggleStok(product.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Stok yok</span>
                          </label>
                          {outOfStockIds.has(product.id) && (
                            <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                              Stok bitti
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.06)] z-10">
                          <div className="flex gap-2 items-center">
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-200 transition-colors"
                              title="Ürünü düzenle"
                            >
                              <Edit className="w-4 h-4" />
                              Düzenle
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                              title="Ürünü sil"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <ProductModal
            title="Yeni Ürün Ekle"
            formData={formData}
            setFormData={setFormData}
            onSave={handleAddProduct}
            onClose={() => {
              setShowAddModal(false)
              resetForm()
            }}
          />
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <ProductModal
            title="Ürünü Düzenle"
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateProduct}
            onClose={() => {
              setEditingProduct(null)
              resetForm()
            }}
          />
        )}
      </div>
    </AdminRoute>
  )
}

function PriceEditor({
  productId,
  currentPrice,
  onUpdate,
  readOnly = false,
}: {
  productId: string
  currentPrice?: number
  onUpdate: (id: string, price: string) => void
  readOnly?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(currentPrice?.toString() || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(productId, price)
    setSaving(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="0.00"
          step="0.01"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-green-600 hover:text-green-700"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => {
            setEditing(false)
            setPrice(currentPrice?.toString() || '')
          }}
          className="text-gray-600 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (readOnly) {
    return (
      <span className="text-gray-500 text-sm">
        {currentPrice ? `${currentPrice.toFixed(2)} ₺` : '—'}
      </span>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-900 font-medium">
        {currentPrice ? `${currentPrice.toFixed(2)} ₺` : 'Fiyat yok'}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="text-primary-600 hover:text-primary-700"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  )
}

function ProductModal({
  title,
  formData,
  setFormData,
  onSave,
  onClose,
}: {
  title: string
  formData: {
    name: string
    description: string
    category: string
    imageUrl: string
    price: string
    features: string
  }
  setFormData: (data: typeof formData) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol: Form alanları */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-y"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Özellikler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Özellik 1, Özellik 2, Özellik 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Sağ: Ürün görseli önizleme + link */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Görseli</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center min-h-[300px]">
                  {formData.imageUrl ? (
                    <>
                      <div className="flex-1 flex items-center justify-center w-full min-h-[240px]">
                        <img
                          key={formData.imageUrl}
                          src={formData.imageUrl}
                          alt="Ürün görseli"
                          className="max-w-full max-h-[240px] object-contain rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const wrap = target.parentElement
                            const fallback = wrap?.querySelector('[data-fallback]') as HTMLElement | null
                            if (fallback) fallback.style.display = 'block'
                          }}
                        />
                        <div data-fallback className="hidden text-gray-400 text-sm text-center py-4">
                          Görsel yüklenemedi
                        </div>
                      </div>
                      <a
                        href={formData.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 text-sm text-primary-600 hover:text-primary-700 break-all max-w-full block text-center px-2"
                      >
                        {formData.imageUrl}
                      </a>
                    </>
                  ) : (
                    <div className="text-gray-400 text-sm text-center py-8">
                      <p>Görsel URL ekleyin</p>
                      <p className="mt-1 text-xs">Ürün görseli burada önizlenecek</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
