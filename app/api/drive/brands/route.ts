import { NextResponse } from 'next/server'
import { getImagesWithUrls, findSubfolderByName } from '@/lib/google-drive'

/** Brands klasör ID'sini bul: önce env, yoksa ana klasörde "Brands" alt klasörünü ara */
async function resolveBrandsFolderId(): Promise<string | null> {
  const direct = process.env.GOOGLE_DRIVE_BRANDS_FOLDER_ID?.trim()
  if (direct) return direct

  const mainFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()
  if (!mainFolderId) return null

  return findSubfolderByName(mainFolderId, 'Brands')
}

/**
 * Lists all image files in the Google Drive "Brands" folder and returns
 * direct image URLs for use in <img src>.
 * Folder: GOOGLE_DRIVE_BRANDS_FOLDER_ID veya GOOGLE_DRIVE_FOLDER_ID altında "Brands" klasörü.
 */
export async function GET() {
  try {
    const folderId = await resolveBrandsFolderId()

    if (!folderId) {
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
