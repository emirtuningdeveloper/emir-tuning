'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { ChevronLeft, Network } from 'lucide-react'

export default function AdminApiYonetimiPage() {
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
              <h1 className="text-2xl font-bold text-gray-900">API Yönetimi</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg border p-12 text-center">
            <Network className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Harici API&apos;ler</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Harici API konfigürasyonları ve izleme. Detaylar sonra eklenebilir.
            </p>
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}
