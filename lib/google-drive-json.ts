import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'

// JSON dosyasından private key oku (alternatif yöntem)
function getPrivateKeyFromJson(): string | null {
  try {
    const jsonPath = path.join(process.cwd(), '..', 'emir-tuning-web-7a1b7f637cd7 (1).json')
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8')
      const json = JSON.parse(jsonContent)
      return json.private_key || null
    }
  } catch (error) {
    console.error('Error reading JSON file:', error)
  }
  return null
}

// Google Drive API client oluştur (JSON'dan private key ile)
export function getDriveClientFromJson() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = getPrivateKeyFromJson()

  if (!privateKey) {
    // Fallback: environment variable'dan al
    privateKey = process.env.GOOGLE_PRIVATE_KEY || ''
  }

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Drive credentials are not configured')
  }

  // Private key'i düzgün formatla
  privateKey = privateKey.trim()
  
  // Eğer tırnak içindeyse kaldır
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  
  // \n karakterlerini gerçek newline'lara çevir
  privateKey = privateKey.replace(/\\n/g, '\n')
  
  // BEGIN ve END satırlarını kontrol et
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Invalid private key format: Missing BEGIN PRIVATE KEY marker')
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
    throw new Error(`Failed to create Drive client: ${error.message}`)
  }
}
