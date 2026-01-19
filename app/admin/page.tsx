'use client'

import AdminRoute from '@/components/AdminRoute'
import { useRouter } from 'next/navigation'
import { logoutAdmin, getCurrentUser } from '@/lib/auth'
import { Package, Settings, LogOut, Plus } from 'lucide-react'
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

            {/* Hizmet Yönetimi */}
            <div className="bg-white rounded-lg shadow-md p-6 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-500">Hizmet Yönetimi</h2>
                  <p className="text-sm text-gray-500">Yakında eklenecek</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}
