/**
 * Firebase Admin SDK – sadece sunucu tarafında (API route'larında) kullanılır.
 * Firestore yazma işlemleri güvenlik kurallarını bypass eder (service account ile).
 * Ürün ekleme: POST /api/admin/products bu modülü kullanır.
 */

import * as admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import type { Product } from './types'

let adminApp: admin.app.App | null = null

function getServiceAccountPath(): string | null {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (envPath && fs.existsSync(envPath)) return envPath
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, 'firebase-service-account.json'),
    path.join(cwd, 'service-account.json'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

function getAdminApp(): admin.app.App {
  if (adminApp) return adminApp
  const jsonPath = getServiceAccountPath()
  if (jsonPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.project_id
    if (serviceAccount.project_id !== projectId) {
      console.warn(
        '[firebase-admin-server] service-account project_id (%s) != Firebase project (%s). Firestore may be in a different project.',
        serviceAccount.project_id,
        projectId
      )
    }
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: projectId,
    })
    return adminApp
  }
  throw new Error(
    'Firebase Admin credentials not found. Add firebase-service-account.json or service-account.json (Firebase project) to the project root, or set GOOGLE_APPLICATION_CREDENTIALS. Download the key from Firebase Console > Project Settings > Service Accounts > Generate new private key.'
  )
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore()
}

/** Firestore'dan kategoriye göre ürünleri okur. Hem tam path hem son segment ile dener (path uyumsuzluğuna karşı). */
export async function getProductsByCategoryServer(
  categoryPath: string
): Promise<{ id: string; name: string; imageUrl: string; productUrl?: string }[]> {
  try {
    const db = getAdminFirestore()
    const seenIds = new Set<string>()
    const result: { id: string; name: string; imageUrl: string; productUrl?: string }[] = []

    const addFromSnapshot = (snapshot: admin.firestore.QuerySnapshot) => {
      snapshot.docs.forEach((doc) => {
        if (seenIds.has(doc.id)) return
        seenIds.add(doc.id)
        const d = doc.data()
        result.push({
          id: doc.id,
          name: (d.name as string) || '',
          imageUrl: (d.imageUrl as string) || '',
          productUrl: undefined,
        })
      })
    }

    // 1) Tam path ile sorgula (örn. dis-aksesuarlar/plastik-yan-kapi-citasi)
    const snapshot1 = await db
      .collection('products')
      .where('category', '==', categoryPath)
      .get()
    addFromSnapshot(snapshot1)

    // 2) Path birden fazla segment içeriyorsa son segment ile de sorgula (kayıt farklı path ile yapılmış olabilir)
    const lastSegment = categoryPath.includes('/')
      ? categoryPath.split('/').pop()!
      : null
    if (lastSegment && lastSegment !== categoryPath) {
      const snapshot2 = await db
        .collection('products')
        .where('category', '==', lastSegment)
        .get()
      addFromSnapshot(snapshot2)
    }

    return result
  } catch (err) {
    console.error('[firebase-admin-server] getProductsByCategoryServer:', err)
    return []
  }
}

/** Sunucu tarafında Firestore products koleksiyonuna ürün ekler (güvenlik kurallarını bypass eder). */
export async function addProductServer(
  product: Omit<Product, 'id' | 'createdAt'>
): Promise<string> {
  const db = getAdminFirestore()
  const data: Record<string, unknown> = {
    name: product.name,
    description: product.description ?? product.name,
    category: product.category,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
  if (product.imageUrl != null) data.imageUrl = product.imageUrl
  if (product.features != null) data.features = product.features
  if (product.price != null) data.price = product.price
  if (product.outOfStock != null) data.outOfStock = product.outOfStock
  const ref = await db.collection('products').add(data)
  return ref.id
}
