import { google } from 'googleapis'

// Google Drive API client oluştur
export function getDriveClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Drive credentials are not configured')
  }

  // Private key'i düzgün formatla
  privateKey = privateKey.trim()
  
  // Eğer tırnak içindeyse kaldır
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1)
  }
  
  // Node.js environment variable'larında \n bazen literal string olarak gelir
  // Tüm olası formatları dene - en güvenilir yöntem: split/join
  
  // 1. Önce \\n (double escaped) varsa onu çevir
  privateKey = privateKey.replace(/\\\\n/g, '\n')
  
  // 2. Sonra \n (escaped) varsa onu çevir - bu en yaygın format
  privateKey = privateKey.replace(/\\n/g, '\n')
  
  // 3. Eğer hala literal "\n" string'i varsa (backslash karakteri + n karakteri)
  // Bu durumda split/join kullan - bu en güvenilir yöntem
  if (privateKey.includes('\\n')) {
    // Tüm literal \n'leri gerçek newline'lara çevir
    privateKey = privateKey.split('\\n').join('\n')
  }
  
  // BEGIN ve END satırlarını kontrol et
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Invalid private key format: Missing BEGIN PRIVATE KEY marker')
  }
  if (!privateKey.includes('END PRIVATE KEY')) {
    throw new Error('Invalid private key format: Missing END PRIVATE KEY marker')
  }
  
  // Private key'in başında ve sonunda gereksiz karakterleri temizle
  // BEGIN'den önceki her şeyi kaldır
  const beginIndex = privateKey.indexOf('-----BEGIN PRIVATE KEY-----')
  if (beginIndex > 0) {
    privateKey = privateKey.substring(beginIndex)
  }
  
  // END'den sonraki her şeyi kaldır
  const endIndex = privateKey.indexOf('-----END PRIVATE KEY-----')
  if (endIndex > 0) {
    privateKey = privateKey.substring(0, endIndex + '-----END PRIVATE KEY-----'.length)
  }
  
  // Private key'in sonunda newline olmalı
  if (!privateKey.endsWith('\n')) {
    privateKey = privateKey + '\n'
  }
  
  // BEGIN satırının başında newline olmamalı (PEM formatı)
  if (privateKey.startsWith('\n-----BEGIN')) {
    privateKey = privateKey.substring(1)
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })

    return google.drive({ version: 'v3', auth })
  } catch (error: any) {
    console.error('JWT Auth Error:', error.message)
    console.error('Error code:', error.code)
    
    // DECODER hatası durumunda JSON dosyasından private key'i dene
    if (error.message.includes('DECODER') || error.code === 'ERR_OSSL_UNSUPPORTED') {
      try {
        const fs = require('fs')
        const path = require('path')
        // JSON dosyasını proje klasöründe ara
        const jsonPath = path.join(process.cwd(), 'service-account.json')
        
        if (fs.existsSync(jsonPath)) {
          console.log('Trying to use private key from JSON file...')
          const jsonContent = fs.readFileSync(jsonPath, 'utf8')
          const json = JSON.parse(jsonContent)
          const jsonPrivateKey = json.private_key
          
          // JSON'daki private key'i dene (bu zaten doğru formatta)
          const authFromJson = new google.auth.JWT({
            email: serviceAccountEmail,
            key: jsonPrivateKey,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
          })
          
          console.log('Successfully using private key from JSON file')
          return google.drive({ version: 'v3', auth: authFromJson })
        }
      } catch (jsonError: any) {
        console.error('Failed to use JSON file:', jsonError.message)
      }
      
      throw new Error(`Private key decode error. Tried both .env.local and JSON file.
Error: ${error.message}`)
    }
    throw new Error(`Failed to create Drive client: ${error.message}`)
  }
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink?: string
  thumbnailLink?: string
  size?: string
}

/**
 * Belirli bir klasördeki tüm görselleri getir
 */
export async function getImagesFromFolder(folderId: string): Promise<DriveFile[]> {
  try {
    const drive = getDriveClient()

    // Görsel dosya tipleri
    const imageMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ]

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and (${imageMimeTypes
        .map((type) => `mimeType='${type}'`)
        .join(' or ')})`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, size)',
      orderBy: 'name',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    return (response.data.files || []) as DriveFile[]
  } catch (error) {
    console.error('Error fetching images from Google Drive:', error)
    throw error
  }
}

/**
 * Belirli bir dosyanın public URL'ini al
 */
export async function getFilePublicUrl(fileId: string): Promise<string> {
  try {
    const drive = getDriveClient()

    // Önce dosyanın mevcut izinlerini kontrol et
    try {
      const permissions = await drive.permissions.list({
        fileId,
        fields: 'permissions(id,type,role)',
      })

      // Eğer zaten public değilse, public yap
      const hasPublicAccess = permissions.data.permissions?.some(
        (p: any) => p.type === 'anyone' && p.role === 'reader'
      )

      if (!hasPublicAccess) {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        })
      }
    } catch (permError: any) {
      // İzin hatası olsa bile devam et
      console.warn('Permission error (may already be public):', permError.message)
    }

    // Dosya bilgilerini al
    const file = await drive.files.get({
      fileId,
      fields: 'webContentLink, webViewLink, thumbnailLink',
      supportsAllDrives: true,
    })

    const data = file.data as any

    // En iyi URL'i seç - thumbnailLink en güvenilir
    // 1. thumbnailLink (en güvenilir, her zaman çalışır)
    if (data.thumbnailLink) {
      // Thumbnail link'ini büyük boyut için güncelle
      // s1920 = 1920px genişlik (yeterince büyük)
      const thumbnailUrl = data.thumbnailLink.replace(/=s\d+/, '=s1920')
      return thumbnailUrl
    }

    // 2. webContentLink (direkt indirme linki)
    if (data.webContentLink) {
      // export=download yerine view kullan
      let url = data.webContentLink
      url = url.replace('&export=download', '')
      url = url.replace('?export=download', '?export=view')
      if (!url.includes('export=')) {
        url += (url.includes('?') ? '&' : '?') + 'export=view'
      }
      return url
    }

    // 3. Fallback: Google Drive viewer URL (bu format genellikle çalışır)
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  } catch (error: any) {
    console.error('Error getting file public URL:', error)
    // Fallback URL - bu format genellikle çalışır
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
}

/**
 * Tüm görselleri public URL'leri ile birlikte getir
 */
export async function getImagesWithUrls(folderId: string): Promise<Array<DriveFile & { publicUrl: string }>> {
  try {
    const images = await getImagesFromFolder(folderId)
    console.log(`Found ${images.length} images in Drive folder`)
    
    const imagesWithUrls = await Promise.all(
      images.map(async (image, index) => {
        try {
          console.log(`Processing image ${index + 1}/${images.length}: ${image.name}`)
          const publicUrl = await getFilePublicUrl(image.id)
          console.log(`Got URL for ${image.name}: ${publicUrl.substring(0, 100)}...`)
          return {
            ...image,
            publicUrl,
          }
        } catch (urlError: any) {
          console.error(`Error getting URL for ${image.name}:`, urlError.message)
          // Fallback URL kullan
          return {
            ...image,
            publicUrl: `https://drive.google.com/uc?export=view&id=${image.id}`,
          }
        }
      })
    )
    
    console.log(`Successfully processed ${imagesWithUrls.length} images`)
    return imagesWithUrls
  } catch (error) {
    console.error('Error getting images with URLs:', error)
    throw error
  }
}
