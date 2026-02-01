import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'

/** .env'den veya service-account.json'dan email + private key al (JSON öncelikli, JWT imza hatası önlenir) */
function getGoogleCredentials(): { email: string; key: string } {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const jsonPath = path.join(process.cwd(), 'service-account.json')

  // 1) Önce service-account.json varsa onu kullan (private key formatı her zaman doğru)
  if (fs.existsSync(jsonPath)) {
    try {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8')
      const json = JSON.parse(jsonContent)
      const key = json.private_key
      const em = email || json.client_email
      if (em && key) {
        return { email: em, key }
      }
    } catch (e) {
      console.warn('service-account.json okunamadı, .env kullanılıyor:', (e as Error).message)
    }
  }

  // 2) .env'den oku
  if (!email || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Drive credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local, or add service-account.json to the project root.')
  }

  let privateKey = process.env.GOOGLE_PRIVATE_KEY.trim()
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1)
  }
  privateKey = privateKey.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n')
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.split('\\n').join('\n')
  }
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('Invalid private key format in .env. Use service-account.json for a reliable setup.')
  }
  const beginIndex = privateKey.indexOf('-----BEGIN PRIVATE KEY-----')
  if (beginIndex > 0) privateKey = privateKey.substring(beginIndex)
  const endIndex = privateKey.indexOf('-----END PRIVATE KEY-----')
  if (endIndex > 0) {
    privateKey = privateKey.substring(0, endIndex + '-----END PRIVATE KEY-----'.length)
  }
  if (!privateKey.endsWith('\n')) privateKey = privateKey + '\n'
  if (privateKey.startsWith('\n-----BEGIN')) privateKey = privateKey.substring(1)

  return { email, key: privateKey }
}

// Google Drive API client oluştur
export function getDriveClient() {
  const { email, key } = getGoogleCredentials()
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  return google.drive({ version: 'v3', auth })
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
 * Ana klasördeki adı verilen alt klasörün ID'sini bul (isim eşleşmesi)
 */
export async function findSubfolderByName(
  parentFolderId: string,
  folderName: string
): Promise<string | null> {
  try {
    const drive = getDriveClient()
    const res = await drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })
    const folders = (res.data.files || []) as { id: string; name: string }[]
    const found = folders.find(
      (f) => f.name.toLowerCase().trim() === folderName.toLowerCase().trim()
    )
    return found ? found.id : null
  } catch {
    return null
  }
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
    } catch {
      // İzin hatası olsa bile devam et (dosya zaten public olabilir)
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
  } catch {
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
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        try {
          const publicUrl = await getFilePublicUrl(image.id)
          return { ...image, publicUrl }
        } catch {
          return {
            ...image,
            publicUrl: `https://drive.google.com/uc?export=view&id=${image.id}`,
          }
        }
      })
    )
    return imagesWithUrls
  } catch (error) {
    console.error('Error getting images with URLs:', error)
    throw error
  }
}
