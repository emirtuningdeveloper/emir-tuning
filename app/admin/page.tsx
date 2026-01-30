'use client'

import AdminRoute from '@/components/AdminRoute'
import { useRouter } from 'next/navigation'
import { logoutAdmin, getCurrentUser } from '@/lib/auth'
import { Package, Settings, LogOut, Plus, Link as LinkIcon, Wrench, Bell, MessageSquare, BarChart3, Network } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ürün Yönetimi */}
            <Link
              href="/admin/urunler"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ürün Yönetimi</h2>
                  <p className="text-sm text-gray-600">Ürünleri yönet ve fiyatları güncelle</p>
                </div>
              </div>
            </Link>

            {/* Kategori URL Yönetimi */}
            <Link
              href="/admin/kategori-urls"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Kategori URL Yönetimi</h2>
                  <p className="text-sm text-gray-600">Kategori URL mapping&apos;lerini yönet</p>
                </div>
              </div>
            </Link>

            {/* Hizmet Yönetimi */}
            <Link
              href="/admin/hizmetler"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Hizmet Yönetimi</h2>
                  <p className="text-sm text-gray-600">Hizmetleri görüntüle ve düzenle</p>
                </div>
              </div>
            </Link>

            {/* Duyurular */}
            <Link
              href="/admin/duyurular"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Duyurular</h2>
                  <p className="text-sm text-gray-600">Duyuruları yönet ve yayınla</p>
                </div>
              </div>
            </Link>

            {/* Referanslar */}
            <Link
              href="/admin/referanslar"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Referanslar</h2>
                  <p className="text-sm text-gray-600">Referansları görüntüle ve düzenle</p>
                </div>
              </div>
            </Link>

            {/* Analitik */}
            <Link
              href="/admin/analitik"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Analitik</h2>
                  <p className="text-sm text-gray-600">Site trafiği ve SEO analizi</p>
                </div>
              </div>
            </Link>

            {/* API Yönetimi */}
            <Link
              href="/admin/api-yonetimi"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Network className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">API Yönetimi</h2>
                  <p className="text-sm text-gray-600">Harici API&apos;leri yönet ve izle</p>
                </div>
              </div>
            </Link>

            {/* Ayarlar */}
            <Link
              href="/admin/ayarlar"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ayarlar</h2>
                  <p className="text-sm text-gray-600">Genel site ayarlarını yönet</p>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}
