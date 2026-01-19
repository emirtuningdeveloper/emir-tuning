'use client'

import { useEffect, useState } from 'react'
import { fetchDriveImages } from '@/lib/drive-client'

export default function TestDrivePage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testDrive() {
      try {
        setLoading(true)
        const driveImages = await fetchDriveImages()
        setImages(driveImages)
        setError(null)
      } catch (err: any) {
        console.error('Test error:', err)
        setError(err.message || 'Hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    testDrive()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Google Drive API Test</h1>
      
      {loading && <p>Yükleniyor...</p>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-semibold">Hata:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <p className="mb-4">Bulunan görsel sayısı: {images.length}</p>
          
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="border rounded p-4">
                  <p className="font-semibold mb-2">{img.name}</p>
                  <p className="text-sm text-gray-600 mb-2">ID: {img.id}</p>
                  {img.publicUrl && (
                    <div className="mt-4">
                      <img 
                        src={img.publicUrl} 
                        alt={img.name}
                        className="w-full h-48 object-cover rounded"
                        onError={(e) => {
                          console.error('Image load error:', img.publicUrl)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2 break-all">{img.publicUrl}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Görsel bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  )
}
