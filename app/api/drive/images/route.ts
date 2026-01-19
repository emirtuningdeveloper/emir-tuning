import { NextResponse } from 'next/server'
import { getImagesWithUrls } from '@/lib/google-drive'

export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY

    if (!folderId) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_FOLDER_ID is not configured' },
        { status: 500 }
      )
    }

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Google Drive credentials are not configured. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY' },
        { status: 500 }
      )
    }

    const images = await getImagesWithUrls(folderId)

    return NextResponse.json({ images })
  } catch (error: any) {
    console.error('Error in API route:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch images from Google Drive',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
