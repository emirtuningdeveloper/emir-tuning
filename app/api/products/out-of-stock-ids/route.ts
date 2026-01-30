import { NextResponse } from 'next/server'
import { getAllProductOverrides } from '@/lib/firestore-admin'

/**
 * Stok bitti işaretli ürün ID'lerini döner (admin productOverrides).
 * Ürün listesi sayfaları bu ID'leri kullanarak "Stok yok" gösterir; ürünler listeden çıkarılmaz.
 */
export async function GET() {
  try {
    const overrides = await getAllProductOverrides()
    const ids = overrides
      .filter((o) => o.outOfStock === true)
      .map((o) => o.productId)
      .filter(Boolean)
    return NextResponse.json({ success: true, ids })
  } catch (err) {
    console.error('out-of-stock-ids error:', err)
    return NextResponse.json(
      { success: false, ids: [], error: err instanceof Error ? err.message : 'Stok bilgisi alınamadı' },
      { status: 200 }
    )
  }
}
