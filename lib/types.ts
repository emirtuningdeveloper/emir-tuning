export interface Product {
  id: string
  name: string
  description: string
  category: string
  imageUrl?: string
  features?: string[]
  price?: number
  createdAt: Date
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
