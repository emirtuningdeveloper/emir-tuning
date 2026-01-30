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
