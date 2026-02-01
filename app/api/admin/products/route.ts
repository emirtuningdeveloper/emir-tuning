import { NextResponse } from 'next/server'
import { addProductServer } from '@/lib/firebase-admin-server'
import { categoryPathToSlug } from '@/lib/product-categories'

/** POST: Toplu ürün ekle (Harici Ürün Çekme akışı). Sunucu tarafında Firebase Admin SDK ile yazar (izin hatası olmaz). */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const categoryRaw = typeof body?.category === 'string' ? body.category.trim() : ''
    const products = Array.isArray(body?.products) ? body.products : []
    if (!categoryRaw) {
      return NextResponse.json(
        { success: false, error: 'category zorunludur' },
        { status: 200 }
      )
    }
    // Kategori path'ini URL slug formatına çevir ki kategori sayfası (slug ile) ile eşleşsin
    const category = categoryPathToSlug(categoryRaw)
    type ToAddItem = { name: string; description: string; category: string; imageUrl?: string }
    const toAdd: ToAddItem[] = products
      .filter((p: unknown) => p && typeof (p as { name?: string }).name === 'string')
      .map((p: { name: string; description?: string; imageUrl?: string }): ToAddItem => ({
        name: (p.name || '').trim(),
        description: typeof p.description === 'string' ? p.description.trim() : (p.name || '').trim(),
        category,
        imageUrl: typeof p.imageUrl === 'string' && p.imageUrl.trim() ? p.imageUrl.trim() : undefined,
      }))
      .filter((p: ToAddItem) => p.name.length > 0)
    const ids: string[] = []
    for (const p of toAdd) {
      const id = await addProductServer({
        ...p,
        description: p.description || p.name,
      })
      ids.push(id)
    }
    return NextResponse.json({ success: true, added: ids.length, ids })
  } catch (err) {
    console.error('POST /api/admin/products error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Ürünler eklenemedi' },
      { status: 200 }
    )
  }
}
