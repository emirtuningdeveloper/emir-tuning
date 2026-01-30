import { NextResponse } from 'next/server'
import { getImagesWithUrls } from '@/lib/google-drive'
import { logApiCall } from '@/lib/api-logger'

export async function GET() {
  const startTime = Date.now()
  let success = false
  let statusCode = 500
  let error: string | undefined

  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY

    if (!folderId) {
      error = 'GOOGLE_DRIVE_FOLDER_ID is not configured'
      statusCode = 500
      await logApiCall(
        'google-drive',
        '/api/drive/images',
        'GET',
        startTime,
        false,
        statusCode,
        error
      )
      return NextResponse.json({ error }, { status: statusCode })
    }

    if (!serviceAccountEmail || !privateKey) {
      error = 'Google Drive credentials are not configured'
      statusCode = 500
      await logApiCall(
        'google-drive',
        '/api/drive/images',
        'GET',
        startTime,
        false,
        statusCode,
        error
      )
      return NextResponse.json(
        { error: 'Google Drive credentials are not configured. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY' },
        { status: statusCode }
      )
    }

    const images = await getImagesWithUrls(folderId)
    success = true
    statusCode = 200

    await logApiCall(
      'google-drive',
      '/api/drive/images',
      'GET',
      startTime,
      true,
      statusCode,
      undefined,
      undefined,
      { count: images.length }
    )

    return NextResponse.json({ images })
  } catch (error: any) {
    console.error('Error in API route:', error)
    console.error('Error stack:', error.stack)
    error = error.message || 'Failed to fetch images from Google Drive'
    
    await logApiCall(
      'google-drive',
      '/api/drive/images',
      'GET',
      startTime,
      false,
      statusCode,
      error
    )

    return NextResponse.json(
      { 
        error: error,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    )
  }
}
