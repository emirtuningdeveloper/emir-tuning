import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, getDocs, query, where, getDoc, setDoc, writeBatch, orderBy, limit, Timestamp } from 'firebase/firestore'
import { getDb } from './firebase'
import { Product, ProductOverride, CategoryUrlMapping, CategoryExternalSource, Service, Announcement, Review, SiteSettings, ProductSearchIndex, ApiConfig, ApiLog, ApiStats } from './types'

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

// ==================== Product Override Functions ====================

/**
 * Product Override ekle veya güncelle
 */
export async function upsertProductOverride(
  productId: string,
  override: Omit<ProductOverride, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const db = getDb()
    const overridesRef = collection(db, 'productOverrides')
    
    // Mevcut override'ı kontrol et
    const q = query(overridesRef, where('productId', '==', productId))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      // Güncelle
      const existingDoc = snapshot.docs[0]
      const docRef = doc(db, 'productOverrides', existingDoc.id)
      await updateDoc(docRef, {
        ...override,
        updatedAt: serverTimestamp(),
      })
      return existingDoc.id
    } else {
      // Yeni ekle
      const docRef = await addDoc(overridesRef, {
        ...override,
        productId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    }
  } catch (error) {
    console.error('Error upserting product override:', error)
    throw error
  }
}

/**
 * Product Override getir
 */
export async function getProductOverride(productId: string): Promise<ProductOverride | null> {
  try {
    const db = getDb()
    const overridesRef = collection(db, 'productOverrides')
    const q = query(overridesRef, where('productId', '==', productId))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    const docData = snapshot.docs[0].data()
    return {
      id: snapshot.docs[0].id,
      ...docData,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate(),
    } as ProductOverride
  } catch (error) {
    console.error('Error getting product override:', error)
    return null
  }
}

/**
 * Tüm Product Override'ları getir
 */
export async function getAllProductOverrides(): Promise<ProductOverride[]> {
  try {
    const db = getDb()
    const overridesRef = collection(db, 'productOverrides')
    const snapshot = await getDocs(overridesRef)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as ProductOverride
    })
  } catch (error) {
    console.error('Error getting all product overrides:', error)
    return []
  }
}

/**
 * Product Override sil
 */
export async function deleteProductOverride(overrideId: string): Promise<void> {
  try {
    const db = getDb()
    const overrideRef = doc(db, 'productOverrides', overrideId)
    await deleteDoc(overrideRef)
  } catch (error) {
    console.error('Error deleting product override:', error)
    throw error
  }
}

// ==================== Category URL Mapping Functions ====================

/**
 * Category URL Mapping ekle veya güncelle
 */
export async function upsertCategoryUrlMapping(
  internalPath: string,
  mapping: Omit<CategoryUrlMapping, 'id' | 'internalPath' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const db = getDb()
    const mappingsRef = collection(db, 'categoryUrlMappings')
    
    // Mevcut mapping'i kontrol et
    const q = query(mappingsRef, where('internalPath', '==', internalPath))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      // Güncelle
      const existingDoc = snapshot.docs[0]
      const docRef = doc(db, 'categoryUrlMappings', existingDoc.id)
      await updateDoc(docRef, {
        ...mapping,
        internalPath,
        updatedAt: serverTimestamp(),
      })
      return existingDoc.id
    } else {
      // Yeni ekle
      const docRef = await addDoc(mappingsRef, {
        ...mapping,
        internalPath,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    }
  } catch (error) {
    console.error('Error upserting category URL mapping:', error)
    throw error
  }
}

/**
 * Category URL Mapping getir
 */
export async function getCategoryUrlMapping(internalPath: string): Promise<CategoryUrlMapping | null> {
  try {
    const db = getDb()
    const mappingsRef = collection(db, 'categoryUrlMappings')
    const q = query(mappingsRef, where('internalPath', '==', internalPath))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    const docData = snapshot.docs[0].data()
    return {
      id: snapshot.docs[0].id,
      ...docData,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate(),
    } as CategoryUrlMapping
  } catch (error) {
    console.error('Error getting category URL mapping:', error)
    return null
  }
}

/**
 * Tüm Category URL Mapping'leri getir
 */
export async function getAllCategoryUrlMappings(): Promise<CategoryUrlMapping[]> {
  try {
    const db = getDb()
    const mappingsRef = collection(db, 'categoryUrlMappings')
    const snapshot = await getDocs(mappingsRef)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as CategoryUrlMapping
    })
  } catch (error) {
    console.error('Error getting all category URL mappings:', error)
    return []
  }
}

/**
 * Category URL Mapping sil
 */
export async function deleteCategoryUrlMapping(mappingId: string): Promise<void> {
  try {
    const db = getDb()
    const mappingRef = doc(db, 'categoryUrlMappings', mappingId)
    await deleteDoc(mappingRef)
  } catch (error) {
    console.error('Error deleting category URL mapping:', error)
    throw error
  }
}

// ==================== Category External Sources (Harici Kategori Linkleri) ====================

/**
 * Bir kategoriye ait harici kaynakları getir
 */
export async function getCategoryExternalSources(categoryPath: string): Promise<CategoryExternalSource[]> {
  try {
    const db = getDb()
    const ref = collection(db, 'categoryExternalSources')
    const q = query(ref, where('categoryPath', '==', categoryPath))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || undefined,
        updatedAt: data.updatedAt?.toDate?.() || undefined,
      } as CategoryExternalSource
    })
  } catch (error) {
    console.error('Error getting category external sources:', error)
    return []
  }
}

/**
 * Kategoriye harici kaynak ekle
 */
export async function addCategoryExternalSource(
  data: Omit<CategoryExternalSource, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const db = getDb()
    const ref = collection(db, 'categoryExternalSources')
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding category external source:', error)
    throw error
  }
}

/**
 * Harici kaynak sil
 */
export async function deleteCategoryExternalSource(id: string): Promise<void> {
  try {
    const db = getDb()
    const docRef = doc(db, 'categoryExternalSources', id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting category external source:', error)
    throw error
  }
}

// ==================== Service Functions ====================

/**
 * Hizmet ekle
 */
export async function addService(service: Omit<Service, 'id' | 'createdAt'>): Promise<string> {
  try {
    const db = getDb()
    const servicesRef = collection(db, 'services')
    
    const docRef = await addDoc(servicesRef, {
      ...service,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error adding service:', error)
    throw error
  }
}

/**
 * Hizmet güncelle
 */
export async function updateService(serviceId: string, updates: Partial<Service>): Promise<void> {
  try {
    const db = getDb()
    const serviceRef = doc(db, 'services', serviceId)
    
    await updateDoc(serviceRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating service:', error)
    throw error
  }
}

/**
 * Hizmet sil
 */
export async function deleteService(serviceId: string): Promise<void> {
  try {
    const db = getDb()
    const serviceRef = doc(db, 'services', serviceId)
    await deleteDoc(serviceRef)
  } catch (error) {
    console.error('Error deleting service:', error)
    throw error
  }
}

// ==================== Announcement Functions ====================

/**
 * Duyuru ekle
 */
export async function addAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
  try {
    const db = getDb()
    const announcementsRef = collection(db, 'announcements')
    
    const docRef = await addDoc(announcementsRef, {
      ...announcement,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error adding announcement:', error)
    throw error
  }
}

/**
 * Duyuru güncelle
 */
export async function updateAnnouncement(announcementId: string, updates: Partial<Announcement>): Promise<void> {
  try {
    const db = getDb()
    const announcementRef = doc(db, 'announcements', announcementId)
    
    await updateDoc(announcementRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating announcement:', error)
    throw error
  }
}

/**
 * Duyuru sil
 */
export async function deleteAnnouncement(announcementId: string): Promise<void> {
  try {
    const db = getDb()
    const announcementRef = doc(db, 'announcements', announcementId)
    await deleteDoc(announcementRef)
  } catch (error) {
    console.error('Error deleting announcement:', error)
    throw error
  }
}

/**
 * Tüm duyuruları getir
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    const db = getDb()
    const announcementsRef = collection(db, 'announcements')
    const snapshot = await getDocs(announcementsRef)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
      } as Announcement
    })
  } catch (error) {
    console.error('Error getting all announcements:', error)
    return []
  }
}

// ==================== Review Functions ====================

/**
 * Yorum ekle
 */
export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  try {
    const db = getDb()
    const reviewsRef = collection(db, 'reviews')
    
    const docRef = await addDoc(reviewsRef, {
      ...review,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error adding review:', error)
    throw error
  }
}

/**
 * Yorum güncelle
 */
export async function updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
  try {
    const db = getDb()
    const reviewRef = doc(db, 'reviews', reviewId)
    
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating review:', error)
    throw error
  }
}

/**
 * Yorum sil
 */
export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const db = getDb()
    const reviewRef = doc(db, 'reviews', reviewId)
    await deleteDoc(reviewRef)
  } catch (error) {
    console.error('Error deleting review:', error)
    throw error
  }
}

/**
 * Tüm yorumları getir
 */
export async function getAllReviews(): Promise<Review[]> {
  try {
    const db = getDb()
    const reviewsRef = collection(db, 'reviews')
    const snapshot = await getDocs(reviewsRef)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as Review
    })
  } catch (error) {
    console.error('Error getting all reviews:', error)
    return []
  }
}

// ==================== Site Settings Functions ====================

/**
 * Site ayarlarını getir veya varsayılan ayarları oluştur
 */
export async function getSiteSettings(): Promise<SiteSettings> {
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
    } else {
      // Varsayılan ayarları oluştur
      const defaultSettings: Omit<SiteSettings, 'id' | 'updatedAt'> = {
        siteName: 'Emir Tuning',
        siteDescription: 'Otomotiv Tuning Dünyasında Profesyonel Çözümler',
        contactEmail: '',
        contactPhone: '',
        address: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: '',
        },
        seoSettings: {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
        },
      }
      
      await setDoc(settingsRef, {
        ...defaultSettings,
        updatedAt: serverTimestamp(),
      })
      
      return {
        id: settingsDoc.id,
        ...defaultSettings,
        updatedAt: new Date(),
      } as SiteSettings
    }
  } catch (error) {
    console.error('Error getting site settings:', error)
    throw error
  }
}

/**
 * Site ayarlarını güncelle
 */
export async function updateSiteSettings(settings: Omit<SiteSettings, 'id' | 'updatedAt'>): Promise<void> {
  try {
    const db = getDb()
    const settingsRef = doc(db, 'siteSettings', 'main')
    
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    console.error('Error updating site settings:', error)
    throw error
  }
}

// ==================== Product Search Index Functions ====================

/**
 * Ürün arama index'ine ekle veya güncelle
 */
export async function upsertProductSearchIndex(
  productId: string,
  index: Omit<ProductSearchIndex, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const db = getDb()
    const indexRef = collection(db, 'productSearchIndex')
    
    // Mevcut index'i kontrol et
    const q = query(indexRef, where('productId', '==', productId))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      // Güncelle
      const existingDoc = snapshot.docs[0]
      const docRef = doc(db, 'productSearchIndex', existingDoc.id)
      await updateDoc(docRef, {
        ...index,
        updatedAt: serverTimestamp(),
      })
      return existingDoc.id
    } else {
      // Yeni ekle
      const docRef = await addDoc(indexRef, {
        ...index,
        productId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    }
  } catch (error) {
    console.error('Error upserting product search index:', error)
    throw error
  }
}

/**
 * Toplu ürün arama index'i ekle/güncelle (batch write)
 */
export async function batchUpsertProductSearchIndex(
  indexes: Array<Omit<ProductSearchIndex, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: number; failed: number; errors: string[] }> {
  const db = getDb()
  const indexRef = collection(db, 'productSearchIndex')
  
  let success = 0
  let failed = 0
  const errors: string[] = []
  const BATCH_SIZE = 500 // Firestore batch limit
  
  try {
    // Mevcut index'leri çek (productId'ye göre)
    const existingIndexes = new Map<string, string>() // productId -> docId
    const allExisting = await getDocs(indexRef)
    allExisting.docs.forEach(doc => {
      const data = doc.data()
      if (data.productId) {
        existingIndexes.set(data.productId, doc.id)
      }
    })
    
    // Batch'leri oluştur
    for (let i = 0; i < indexes.length; i += BATCH_SIZE) {
      const batchSlice = indexes.slice(i, i + BATCH_SIZE)
      const batch = writeBatch(db) // Her batch slice için yeni batch
      
      for (const index of batchSlice) {
        try {
          const existingDocId = existingIndexes.get(index.productId)
          
          if (existingDocId) {
            // Güncelle
            const docRef = doc(db, 'productSearchIndex', existingDocId)
            batch.update(docRef, {
              ...index,
              updatedAt: serverTimestamp(),
            })
          } else {
            // Yeni ekle
            const docRef = doc(indexRef)
            batch.set(docRef, {
              ...index,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
          success++
        } catch (err: any) {
          failed++
          errors.push(`Error processing index for productId ${index.productId}: ${err.message}`)
        }
      }
      
      // Batch'i commit et
      await batch.commit()
    }
    
    return { success, failed, errors }
  } catch (error: any) {
    console.error('Error batch upserting product search index:', error)
    throw error
  }
}

/**
 * Tüm arama index'lerini sil (yeniden oluşturmak için)
 */
export async function clearProductSearchIndex(): Promise<void> {
  try {
    const db = getDb()
    const indexRef = collection(db, 'productSearchIndex')
    const snapshot = await getDocs(indexRef)
    
    const batch = writeBatch(db)
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error clearing product search index:', error)
    throw error
  }
}

/**
 * Tüm arama index'lerini getir (admin için)
 */
export async function getAllProductSearchIndex(): Promise<ProductSearchIndex[]> {
  try {
    const db = getDb()
    const indexRef = collection(db, 'productSearchIndex')
    const snapshot = await getDocs(indexRef)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as ProductSearchIndex
    })
  } catch (error) {
    console.error('Error getting all product search index:', error)
    return []
  }
}

/**
 * Arama index'lerini getir
 */
export async function searchProductIndex(searchQuery: string, limit: number = 20): Promise<ProductSearchIndex[]> {
  try {
    const db = getDb()
    const indexRef = collection(db, 'productSearchIndex')
    
    // Basit arama: productName ve searchKeywords alanlarında arama
    // Firestore'da tam text search yok, bu yüzden client-side filtreleme yapacağız
    const snapshot = await getDocs(indexRef)
    
    const normalizedQuery = searchQuery.toLowerCase().trim()
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0)
    
    const results = snapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as ProductSearchIndex
      })
      .filter(index => {
        // Her kelime için kontrol et
        const productNameLower = index.productName.toLowerCase()
        const keywordsLower = index.searchKeywords.map(k => k.toLowerCase()).join(' ')
        const categoryLower = index.categoryLabel.toLowerCase()
        
        // Tüm kelimelerin eşleşmesi gerekiyor (AND mantığı)
        return queryWords.every(word => 
          productNameLower.includes(word) || 
          keywordsLower.includes(word) ||
          categoryLower.includes(word)
        )
      })
      .slice(0, limit)
    
    return results
  } catch (error) {
    console.error('Error searching product index:', error)
    return []
  }
}

// ==================== API Management Functions ====================

/**
 * API config getir
 */
export async function getApiConfig(apiName: string): Promise<ApiConfig | null> {
  try {
    const db = getDb()
    const configRef = doc(db, 'apiConfigs', apiName)
    const configDoc = await getDoc(configRef)
    
    if (configDoc.exists()) {
      const data = configDoc.data()
      return {
        id: configDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ApiConfig
    }
    
    return null
  } catch (error) {
    console.error('Error getting API config:', error)
    return null
  }
}

/**
 * API config güncelle
 */
export async function updateApiConfig(apiName: string, config: Partial<ApiConfig>): Promise<void> {
  try {
    const db = getDb()
    const configRef = doc(db, 'apiConfigs', apiName)
    
    await setDoc(configRef, {
      ...config,
      name: apiName,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    console.error('Error updating API config:', error)
    throw error
  }
}

/**
 * Tüm API config'leri getir
 */
export async function getAllApiConfigs(): Promise<ApiConfig[]> {
  try {
    const db = getDb()
    const configsRef = collection(db, 'apiConfigs')
    const snapshot = await getDocs(configsRef)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ApiConfig
    })
  } catch (error) {
    console.error('Error getting all API configs:', error)
    return []
  }
}

/**
 * API çağrısını logla
 */
export async function logApiCall(log: Omit<ApiLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const db = getDb()
    const logsRef = collection(db, 'apiLogs')
    
    await addDoc(logsRef, {
      ...log,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error logging API call:', error)
    // Logging hatası uygulamayı durdurmamalı
  }
}

/**
 * API loglarını getir
 */
export async function getApiLogs(
  apiName?: string,
  limitCount: number = 100,
  startDate?: Date,
  endDate?: Date
): Promise<ApiLog[]> {
  try {
    const db = getDb()
    const logsRef = collection(db, 'apiLogs')
    
    let q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount))
    
    if (apiName) {
      q = query(logsRef, where('apiName', '==', apiName), orderBy('timestamp', 'desc'), limit(limitCount))
    }
    
    if (startDate || endDate) {
      const conditions: any[] = []
      if (apiName) {
        conditions.push(where('apiName', '==', apiName))
      }
      if (startDate) {
        conditions.push(where('timestamp', '>=', Timestamp.fromDate(startDate)))
      }
      if (endDate) {
        conditions.push(where('timestamp', '<=', Timestamp.fromDate(endDate)))
      }
      conditions.push(orderBy('timestamp', 'desc'))
      conditions.push(limit(limitCount))
      q = query(logsRef, ...conditions)
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ApiLog
    })
  } catch (error) {
    console.error('Error getting API logs:', error)
    return []
  }
}

/**
 * API istatistiklerini getir
 */
export async function getApiStats(
  apiName: string,
  period: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<ApiStats> {
  try {
    const db = getDb()
    const logsRef = collection(db, 'apiLogs')
    
    // Tarih aralığını hesapla
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'hour':
        startDate.setHours(now.getHours() - 1)
        break
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }
    
    const q = query(
      logsRef,
      where('apiName', '==', apiName),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    let totalRequests = 0
    let successfulRequests = 0
    let failedRequests = 0
    let totalResponseTime = 0
    let lastRequestTime: Date | undefined
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      totalRequests++
      
      if (data.success) {
        successfulRequests++
      } else {
        failedRequests++
      }
      
      if (data.responseTime) {
        totalResponseTime += data.responseTime
      }
      
      const timestamp = data.timestamp?.toDate()
      if (timestamp && (!lastRequestTime || timestamp > lastRequestTime)) {
        lastRequestTime = timestamp
      }
    })
    
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0
    
    return {
      apiName,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      lastRequestTime,
      errorRate,
      period,
    }
  } catch (error) {
    console.error('Error getting API stats:', error)
    return {
      apiName,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      period,
    }
  }
}
