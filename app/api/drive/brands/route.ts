import { NextResponse } from 'next/server'
import { getImagesWithUrls } from '@/lib/google-drive'

/**
 * Lists all image files in the Google Drive "Brands" folder and returns
 * direct image URLs for use in <img src>. Folder ID from GOOGLE_DRIVE_BRANDS_FOLDER_ID.
 */
export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_BRANDS_FOLDER_ID

    if (!folderId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('GOOGLE_DRIVE_BRANDS_FOLDER_ID is not configured; returning empty brands list.')
      }
      return NextResponse.json({ images: [] })
    }

    const images = await getImagesWithUrls(folderId)
    const items = images.map((img) => ({
      id: img.id,
      name: img.name,
      publicUrl: img.publicUrl,
    }))

    return NextResponse.json({ images: items })
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string }
    console.error('Error fetching brand logos from Drive:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Failed to fetch brand logos', images: [] },
      { status: 500 }
    )
  }
}
