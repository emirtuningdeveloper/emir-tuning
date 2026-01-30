import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore'
import { getDb } from './firebase'
import { Product, Service, Review, Announcement, SiteSettings } from './types'

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

export async function getApprovedReviews(limit?: number): Promise<Review[]> {
  try {
    const db = getDb()
    const reviewsRef = collection(db, 'reviews')
    const q = query(
      reviewsRef,
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    let reviews = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as Review
    })
    
    if (limit) {
      reviews = reviews.slice(0, limit)
    }
    
    return reviews
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getActiveAnnouncements(type?: 'banner' | 'popup'): Promise<Announcement[]> {
  try {
    const db = getDb()
    const announcementsRef = collection(db, 'announcements')
    let q
    
    if (type) {
      q = query(
        announcementsRef,
        where('isActive', '==', true),
        where('type', '==', type)
      )
    } else {
      q = query(
        announcementsRef,
        where('isActive', '==', true)
      )
    }
    
    const snapshot = await getDocs(q)
    const now = new Date()
    
    let announcements = snapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
        } as Announcement
      })
      .filter(announcement => {
        // ExpiresAt kontrolü
        if (announcement.expiresAt && announcement.expiresAt < now) {
          return false
        }
        return true
      })
    
    // Priority'ye göre sırala (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    announcements.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2)
      if (priorityDiff !== 0) return priorityDiff
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    
    return announcements
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const db = getDb()
    const settingsRef = doc(db, 'siteSettings', 'main')
    const settingsDoc = await getDoc(settingsRef)
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data()
      return {
        id: settingsDoc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as SiteSettings
    }
    
    return null
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}
