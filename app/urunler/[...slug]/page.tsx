'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { productCategories, getReadableCategoryPath } from '@/lib/product-categories'
import { getProxiedImageUrl } from '@/lib/image-proxy'
import { Loader2, Package, ChevronRight } from 'lucide-react'

interface CategoryProduct {
  id: string
  name: string
  imageUrl: string
  productUrl?: string
}

export default function UrunlerCategoryPage() {
  const params = useParams()
  const slug = params.slug as string[] | undefined
  const categoryPath = Array.isArray(slug) ? slug.join('/') : ''
  const categoryTitle = getReadableCategoryPath(categoryPath, productCategories) || categoryPath || 'Ürünler'

  const [products, setProducts] = useState<CategoryProduct[]>([])
  const [outOfStockIds, setOutOfStockIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef(1)
  const loadingMoreRef = useRef(false)
  pageRef.current = page
  loadingMoreRef.current = loadingMore

  // Stok bitti işaretli ürün ID'leri (ürünler listeden çıkarılmaz, sadece "Stok yok" gösterilir)
  useEffect(() => {
    fetch('/api/products/out-of-stock-ids', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.ids)) {
          setOutOfStockIds(new Set(data.ids))
        }
      })
      .catch(() => {})
  }, [])

  const loadPage = useCallback(
    (pageNum: number, append: boolean) => {
      const isFirst = pageNum === 1
      if (isFirst) setLoading(true)
      else setLoadingMore(true)

      fetch(
        `/api/products/by-category?categoryPath=${encodeURIComponent(categoryPath)}&page=${pageNum}`,
        { cache: 'no-store' }
      )
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !Array.isArray(data.products)) {
            if (isFirst) setError(data.error || 'Ürünler yüklenemedi')
            setHasMore(false)
            return
          }
          const list = data.products as CategoryProduct[]
          if (append) {
            setProducts((prev) => {
              const ids = new Set(prev.map((p) => p.id))
              const newOnes = list.filter((p) => !ids.has(p.id))
              return prev.concat(newOnes)
            })
          } else {
            setProducts(list)
          }
          if (list.length === 0) setHasMore(false)
          if (append) setPage((p) => p + 1)
        })
        .catch((err) => {
          if (isFirst) setError(err?.message || 'Ürünler yüklenirken hata oluştu')
          setHasMore(false)
        })
        .finally(() => {
          if (isFirst) setLoading(false)
          else setLoadingMore(false)
        })
    },
    [categoryPath]
  )

  useEffect(() => {
    if (!categoryPath) {
      setLoading(false)
      return
    }
    setError(null)
    setPage(1)
    setHasMore(true)
    loadPage(1, false)
  }, [categoryPath, loadPage])

  useEffect(() => {
    if (!hasMore || loading || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting || loadingMoreRef.current) return
        const nextPage = pageRef.current + 1
        loadingMoreRef.current = true
        loadPage(nextPage, true)
      },
      { rootMargin: '200px', threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadPage])

  if (!categoryPath) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-gray-500">Kategori bulunamadı.</p>
        <Link href="/urunler" className="text-primary-600 hover:underline mt-2 inline-block">
          ← Ürünlere dön
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb + ürün sayısı tek satırda */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/urunler" className="hover:text-primary-600">Ürünler</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-bold underline">{categoryTitle}</span>
        </nav>
        {!loading && !error && products.length > 0 && (
          <p className="text-gray-900 font-bold shrink-0 text-sm">{products.length} ürün listeleniyor</p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/urunler" className="text-primary-600 hover:underline">
            Ürünlere dön
          </Link>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Bu kategoride henüz ürün bulunmuyor.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {products.map((product) => {
              const isOutOfStock = outOfStockIds.has(product.id)
              return (
              <div
                key={product.id}
                className={`group rounded-lg overflow-visible transition-all duration-300 border cursor-default ${isOutOfStock ? 'bg-gray-100 border-gray-200 hover:border-gray-300' : 'bg-white border-gray-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-gray-300'}`}
              >
                <div className="relative aspect-square w-full bg-gray-100 flex items-end justify-center overflow-visible p-2">
                  {product.imageUrl ? (
                    <>
                      <img
                        src={getProxiedImageUrl(product.imageUrl)}
                        alt={product.name}
                        className={`w-full h-full object-contain transition-transform duration-300 origin-bottom ${isOutOfStock ? 'opacity-75' : 'group-hover:scale-[1.4]'}`}
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          t.style.display = 'none'
                          const placeholder = t.parentElement?.querySelector('.img-placeholder')
                          if (placeholder) (placeholder as HTMLElement).style.display = 'flex'
                        }}
                      />
                      <div className="img-placeholder absolute inset-0 hidden items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {isOutOfStock && (
                    <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      Stok yok
                    </span>
                  )}
                </div>
                <div className="p-3 min-h-[2.5rem] flex items-end">
                  <p className={`text-xs font-bold line-clamp-3 leading-tight w-full ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'}`}>
                    {product.name}
                  </p>
                </div>
              </div>
            ); })}
          </div>
          <div ref={sentinelRef} className="h-4 min-h-4" aria-hidden />
          {loadingMore && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <span className="ml-2 text-gray-600">Ürünler yükleniyor...</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
