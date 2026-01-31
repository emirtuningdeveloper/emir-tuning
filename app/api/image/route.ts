import { NextRequest, NextResponse } from 'next/server'

/**
 * Genel görsel proxy: Harici görseller kendi domain'imiz üzerinden sunulur.
 * Tarayıcıda img src sadece sitemizin URL'sini gösterir (orijinal site gizlenir).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL gerekli' }, { status: 400 })
    }

    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'Geçersiz URL' }, { status: 400 })
    }

    const isGoogleDrive =
      imageUrl.includes('googleusercontent.com') || imageUrl.includes('drive.google.com')
    const isDrstuning = imageUrl.includes('drstuning.com')
    const isCarparts = imageUrl.includes('carpartstuning.com')

    const referer = isGoogleDrive
      ? 'https://drive.google.com/'
      : isDrstuning
        ? 'https://www.drstuning.com/'
        : isCarparts
          ? 'https://www.carpartstuning.com/'
          : undefined

    const headers: HeadersInit = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
    }
    if (referer) headers['Referer'] = referer

    const response = await fetch(imageUrl, { headers })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Görsel alınamadı: ${response.status}` },
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
  } catch (err) {
    console.error('Image proxy error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
