import { NextResponse } from 'next/server'
import { getAllProductOverrides, upsertProductOverride } from '@/lib/firestore-admin'

export async function GET() {
  try {
    const overrides = await getAllProductOverrides()
    return NextResponse.json({
      success: true,
      overrides: overrides.map((o) => ({
        productId: o.productId,
        outOfStock: o.outOfStock ?? false,
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
    const productId = body?.productId
    const outOfStock = Boolean(body?.outOfStock)
    if (typeof productId !== 'string' || !productId.trim()) {
      return NextResponse.json(
        { success: false, error: 'productId gerekli' },
        { status: 200 }
      )
    }
    await upsertProductOverride(productId.trim(), { outOfStock })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST overrides error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Stok durumu güncellenemedi.' },
      { status: 200 }
    )
  }
}
