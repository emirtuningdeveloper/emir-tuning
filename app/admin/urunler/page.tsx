'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Link2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminUrunlerLandingPage() {
  const router = useRouter()

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-primary-600 hover:text-primary-700 mb-6 flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Geri
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürün Yönetimi</h1>
          <p className="text-gray-600 mb-10">
            Dahili kategoriden ürün çekme veya başka sitelerden ürün ekleme işlemini seçin.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {/* A - Dahili Ürün Yönetimi */}
            <Link
              href="/admin/urunler/dahili"
              className="group bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-primary-500 hover:shadow-lg transition-all duration-200 flex items-start gap-6"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
                <Package className="w-7 h-7 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Dahili Ürün Yönetimi</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Kategori filtresi, kaynak ve kategorideki ürünleri çek. DRS Tuning ve mevcut kategorilerden ürün yönetimi.
                </p>
                <span className="inline-flex items-center gap-1 text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                  Sayfaya git
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* B - Harici Ürün Çekme */}
            <Link
              href="/admin/urunler/harici"
              className="group bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-primary-500 hover:shadow-lg transition-all duration-200 flex items-start gap-6"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
                <Link2 className="w-7 h-7 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Harici Ürün Çekme</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Ürün çekilecek kategori seçin, harici site URL’sini yapıştırın. Ön gösterim ile ürünleri kontrol edip siteye ekleyin.
                </p>
                <span className="inline-flex items-center gap-1 text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                  Sayfaya git
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
