/**
 * Client-side Google Drive helper functions
 */

export interface DriveImage {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink?: string
  thumbnailLink?: string
  size?: string
  publicUrl: string
}

/**
 * Google Drive'dan görselleri çek
 */
export async function fetchDriveImages(): Promise<DriveImage[]> {
  try {
    const response = await fetch('/api/drive/images')
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Drive API response error:', response.status, errorData)
      throw new Error(errorData.error || `Failed to fetch images: ${response.status}`)
    }

    const data = await response.json()
    console.log('Drive API response:', data)
    return data.images || []
  } catch (error: any) {
    console.error('Error fetching Drive images:', error)
    // Hata durumunda boş array döndür, böylece uygulama çalışmaya devam eder
    throw error // Hata fırlat ki üst seviyede handle edilebilsin
  }
}

/**
 * Dosya adına göre görsel bul
 */
export async function getImageByName(name: string): Promise<DriveImage | null> {
  try {
    const images = await fetchDriveImages()
    console.log('All images from Drive:', images.map(img => img.name))
    
    // Önce tam eşleşme dene
    let found = images.find((img) => img.name.toLowerCase() === name.toLowerCase())
    
    // Tam eşleşme yoksa, dosya adını içeren görseli bul
    if (!found) {
      const nameWithoutExt = name.toLowerCase().replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
      found = images.find((img) => {
        const imgNameLower = img.name.toLowerCase()
        return imgNameLower.includes(nameWithoutExt) || imgNameLower.includes('logo')
      })
    }
    
    console.log('Logo search:', { searchingFor: name, found: found?.name || 'NOT FOUND' })
    return found || null
  } catch (error) {
    console.error('Error in getImageByName:', error)
    return null
  }
}

/**
 * Dosya ID'sine göre görsel bul
 */
export async function getImageById(id: string): Promise<DriveImage | null> {
  const images = await fetchDriveImages()
  return images.find((img) => img.id === id) || null
}
