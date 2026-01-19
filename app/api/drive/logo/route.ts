import { NextResponse } from 'next/server'
import { getImagesWithUrls } from '@/lib/google-drive'

export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!folderId) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_FOLDER_ID is not configured' },
        { status: 500 }
      )
    }

    const images = await getImagesWithUrls(folderId)
    
    // Logo dosyasını bul
    const logo = images.find((img) => {
      const nameLower = img.name.toLowerCase()
      return nameLower === 'logo.png' || 
             nameLower.includes('logo') && nameLower.endsWith('.png')
    })

    if (!logo) {
      return NextResponse.json({
        found: false,
        allImages: images.map(img => ({ name: img.name, id: img.id })),
        message: 'Logo not found in Drive folder'
      })
    }

    return NextResponse.json({
      found: true,
      logo: {
        name: logo.name,
        publicUrl: logo.publicUrl,
        id: logo.id
      }
    })
  } catch (error: any) {
    console.error('Error fetching logo:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch logo',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
