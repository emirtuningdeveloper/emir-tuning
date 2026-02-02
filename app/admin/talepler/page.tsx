'use client'

import AdminRoute from '@/components/AdminRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getContactRequests } from '@/lib/firestore'
import { ContactRequest } from '@/lib/types'
import { ChevronLeft, Loader2, Mail, MessageSquare } from 'lucide-react'

const subjectLabels: Record<string, string> = {
  urun: 'Ürün Hakkında',
  hizmet: 'Hizmet Hakkında',
  fiyat: 'Fiyat Bilgisi',
  randevu: 'Randevu',
  diger: 'Diğer',
}

export default function AdminTaleplerPage() {
  const [list, setList] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await getContactRequests()
      setList(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-5 h-5" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Talepler
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <p className="text-sm text-gray-500 mb-6">
            İletişim sayfasındaki &quot;Bize Ulaşın&quot; formundan gelen talepler burada listelenir.
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : list.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
              Henüz talep yok.
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg border p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{req.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-4 h-4" />
                        {req.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Tel: {req.phone}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Konu:</span>{' '}
                    {subjectLabels[req.subject] ?? req.subject}
                  </p>
                  <p className="text-gray-700 whitespace-pre-line border-t border-gray-100 pt-3 mt-3">
                    {req.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminRoute>
  )
}
