import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { getDb } from './firebase'
import { Product } from './types'

/**
 * Ürün ekle
 */
export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  try {
    const db = getDb()
    const productsRef = collection(db, 'products')
    
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

/**
 * Ürün güncelle
 */
export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
  try {
    const db = getDb()
    const productRef = doc(db, 'products', productId)
    
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

/**
 * Ürün fiyatını güncelle
 */
export async function updateProductPrice(productId: string, price: number): Promise<void> {
  try {
    await updateProduct(productId, { price })
  } catch (error) {
    console.error('Error updating product price:', error)
    throw error
  }
}

/**
 * Ürün sil
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const db = getDb()
    const productRef = doc(db, 'products', productId)
    await deleteDoc(productRef)
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}
