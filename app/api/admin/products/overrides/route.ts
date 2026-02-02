import { NextResponse } from 'next/server'
import { getAllProductOverrides, getProductOverride, upsertProductOverride } from '@/lib/firestore-admin'

export async function GET() {
  try {
    const overrides = await getAllProductOverrides()
    return NextResponse.json({
      success: true,
      overrides: overrides.map((o) => ({
        productId: o.productId,
        outOfStock: o.outOfStock ?? false,
        name: o.name ?? undefined,
        imageUrl: o.imageUrl ?? undefined,
      })),
    })
  } catch (err) {
    console.error('GET overrides error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Overrides alınamadı', overrides: [] },
      { status: 200 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const productId = typeof body?.productId === 'string' ? body.productId.trim() : ''
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId gerekli' },
        { status: 200 }
      )
    }
    const outOfStock = body?.outOfStock !== undefined ? Boolean(body.outOfStock) : undefined
    const name = typeof body?.name === 'string' ? body.name.trim() || undefined : undefined
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() || undefined : undefined

    const existing = await getProductOverride(productId)
    const merged = {
      productId,
      outOfStock: outOfStock !== undefined ? outOfStock : (existing?.outOfStock ?? false),
      name: name !== undefined ? name : (existing?.name ?? undefined),
      imageUrl: imageUrl !== undefined ? imageUrl : (existing?.imageUrl ?? undefined),
    }
    await upsertProductOverride(productId, merged)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST overrides error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Güncellenemedi.' },
      { status: 200 }
    )
  }
}
