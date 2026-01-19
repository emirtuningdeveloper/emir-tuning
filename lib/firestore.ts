import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { getDb } from './firebase'
import { Product, Service } from './types'

export async function getProducts(): Promise<Product[]> {
  try {
    const db = getDb()
    const productsRef = collection(db, 'products')
    
    // Try with orderBy, fallback to simple query if index is missing
    let snapshot
    try {
      const q = query(productsRef, orderBy('createdAt', 'desc'))
      snapshot = await getDocs(q)
    } catch (orderError: any) {
      // If orderBy fails (missing index), fetch without ordering
      if (orderError?.code === 'failed-precondition') {
        console.warn('Firestore index missing, fetching without orderBy')
        snapshot = await getDocs(productsRef)
      } else {
        throw orderError
      }
    }
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Product[]
    
    // Sort manually if orderBy failed
    return products.sort((a, b) => {
      const dateA = a.createdAt.getTime()
      const dateB = b.createdAt.getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const db = getDb()
    const productsRef = collection(db, 'products')
    const q = query(
      productsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Product[]
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return []
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const db = getDb()
    const servicesRef = collection(db, 'services')
    
    // Try with orderBy, fallback to simple query if index is missing
    let snapshot
    try {
      const q = query(servicesRef, orderBy('createdAt', 'desc'))
      snapshot = await getDocs(q)
    } catch (orderError: any) {
      // If orderBy fails (missing index), fetch without ordering
      if (orderError?.code === 'failed-precondition') {
        console.warn('Firestore index missing, fetching without orderBy')
        snapshot = await getDocs(servicesRef)
      } else {
        throw orderError
      }
    }
    
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Service[]
    
    // Sort manually if orderBy failed
    return services.sort((a, b) => {
      const dateA = a.createdAt.getTime()
      const dateB = b.createdAt.getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function getServicesByCategory(category: string): Promise<Service[]> {
  try {
    const db = getDb()
    const servicesRef = collection(db, 'services')
    const q = query(
      servicesRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Service[]
  } catch (error) {
    console.error('Error fetching services by category:', error)
    return []
  }
}
