import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // URL validation
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    // Görseli proxy üzerinden çek
    // Google Drive URL'leri için farklı referer kullan
    const isGoogleDrive = imageUrl.includes('googleusercontent.com') || imageUrl.includes('drive.google.com')
    const referer = isGoogleDrive ? 'https://drive.google.com/' : 'https://www.carpartstuning.com/'
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': referer,
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} - ${imageUrl}`)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      )
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
