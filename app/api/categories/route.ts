import { NextRequest, NextResponse } from 'next/server'
import { getCategoryItems } from '@/lib/firestore-admin'
import { productCategories, flattenCategories, buildCategoriesFromFlat } from '@/lib/product-categories'
import type { Category } from '@/lib/types'

/** GET /api/categories → Category[] (ağaç). ?format=flat → { items: { path, title }[] } */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    let items = await getCategoryItems()
    if (!items || items.length === 0) {
      items = flattenCategories(productCategories)
    }

    if (format === 'flat') {
      return NextResponse.json({ items })
    }

    const categories: Category[] = buildCategoriesFromFlat(items)
    return NextResponse.json(categories)
  } catch (err) {
    console.error('GET /api/categories error:', err)
    return NextResponse.json(
      { error: 'Kategoriler yüklenemedi' },
      { status: 500 }
    )
  }
}
