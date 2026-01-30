import { NextResponse } from 'next/server'
import {
  getCategoryExternalSources,
  addCategoryExternalSource,
  deleteCategoryExternalSource,
} from '@/lib/firestore-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryPath = searchParams.get('categoryPath') ?? ''
    const sources = await getCategoryExternalSources(categoryPath)
    return NextResponse.json({ success: true, sources })
  } catch (err) {
    console.error('GET category-external-sources:', err)
    return NextResponse.json(
      { success: false, sources: [], error: err instanceof Error ? err.message : 'Yüklenemedi' },
      { status: 200 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const categoryPath = body?.categoryPath
    const url = body?.url
    const label = body?.label
    if (typeof categoryPath !== 'string' || !categoryPath.trim() || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'categoryPath ve url zorunludur' },
        { status: 200 }
      )
    }
    await addCategoryExternalSource({
      categoryPath: categoryPath.trim(),
      url: url.trim(),
      label: typeof label === 'string' && label.trim() ? label.trim() : undefined,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST category-external-sources:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Eklenemedi' },
      { status: 200 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id?.trim()) {
      return NextResponse.json({ success: false, error: 'id zorunludur' }, { status: 200 })
    }
    await deleteCategoryExternalSource(id.trim())
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE category-external-sources:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Silinemedi' },
      { status: 200 }
    )
  }
}
