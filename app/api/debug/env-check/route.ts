import { NextResponse } from 'next/server'

/**
 * Vercel'de env değişkenlerinin yüklü olup olmadığını kontrol et.
 * Sadece var/yok döner, değerleri göstermez.
 * Kullanım: https://your-site.vercel.app/api/debug/env-check
 */
export async function GET() {
  const pk = process.env.GOOGLE_PRIVATE_KEY
  return NextResponse.json({
    GOOGLE_DRIVE_BRANDS_FOLDER_ID: !!process.env.GOOGLE_DRIVE_BRANDS_FOLDER_ID,
    GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!pk,
    GOOGLE_PRIVATE_KEY_LENGTH: pk ? pk.length : 0,
    GOOGLE_PRIVATE_KEY_HAS_QUOTES: pk ? pk.trim().startsWith('"') : false,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}
