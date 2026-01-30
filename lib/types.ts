export interface Product {
  id: string
  name: string
  description: string
  category: string
  imageUrl?: string
  features?: string[]
  price?: number
  outOfStock?: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface ProductOverride {
  id?: string
  productId: string
  name?: string
  description?: string
  imageUrl?: string
  outOfStock?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Service {
  id: string
  name: string
  description: string
  category: string
  imageUrl?: string
  features?: string[]
  createdAt: Date
}

export interface Category {
  title: string
  slug: string
  children?: Category[]
}

/** Kategoriye eklenen harici site linki (başka siteden ürün çekmek için) */
export interface CategoryExternalSource {
  id?: string
  categoryPath: string
  url: string
  label?: string
  createdAt?: Date
  updatedAt?: Date
}

/** Müşteri yorumu / referans (referanslar sayfası) */
export interface Review {
  id: string
  customerName: string
  vehicleModel?: string
  service?: string
  comment: string
  rating: number
  imageUrl?: string
  isApproved?: boolean
  createdAt: Date
  updatedAt?: Date
}

/** Duyuru / kampanya (üst şerit veya popup) */
export interface Announcement {
  id: string
  title?: string
  content: string
  type: 'banner' | 'popup'
  isActive?: boolean
  priority?: 'high' | 'medium' | 'low'
  expiresAt?: Date
  createdAt: Date
  updatedAt?: Date
}

/** Site genel ayarları */
export interface SiteSettings {
  id?: string
  siteName?: string
  siteDescription?: string
  /** Site logosu görsel URL (header'da gösterilir) */
  logoUrl?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  homepageText?: string
  /** Hakkımızda sayfası metni (admin’den düzenlenebilir) */
  aboutPageText?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
  }
  updatedAt?: Date
}

/** Kategori URL eşlemesi (DRS slug vb.) */
export interface CategoryUrlMapping {
  id?: string
  internalPath: string
  externalSlug?: string
  label?: string
  createdAt?: Date
  updatedAt?: Date
}

/** Ürün arama index kaydı */
export interface ProductSearchIndex {
  id?: string
  productId: string
  name: string
  category?: string
  searchTerms?: string[]
  createdAt?: Date
  updatedAt?: Date
}

/** Harici API konfigürasyonu */
export interface ApiConfig {
  id?: string
  apiName: string
  enabled?: boolean
  config?: Record<string, unknown>
  updatedAt?: Date
}

/** API çağrı logu */
export interface ApiLog {
  id?: string
  apiName: string
  method?: string
  status?: number
  createdAt?: Date
}

/** API istatistikleri */
export interface ApiStats {
  id?: string
  apiName: string
  requestCount?: number
  lastRequestAt?: Date
}
