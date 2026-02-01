import { NextResponse } from 'next/server'
import { updateCategoryItems } from '@/lib/firestore-admin'
import type { ManagedCategoryItem } from '@/lib/types'

/** POST /api/admin/categories → body: { items: ManagedCategoryItem[] } */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = body?.items
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'items dizisi gerekli' },
        { status: 400 }
      )
    }
    const valid = items.every(
      (x: unknown) =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as { path?: unknown }).path === 'string' &&
        typeof (x as { title?: unknown }).title === 'string'
    )
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Her öğe { path: string, title: string } olmalı' },
        { status: 400 }
      )
    }
    const list: ManagedCategoryItem[] = items.map((x: { path: string; title: string }) => ({
      path: String(x.path).trim(),
      title: String(x.title).trim(),
    }))
    await updateCategoryItems(list)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/admin/categories error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Kaydetme hatası' },
      { status: 500 }
    )
  }
}
