'use client'

import AdminRoute from '@/components/AdminRoute'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts } from '@/lib/firestore'
import { addProduct, updateProduct, updateProductPrice, deleteProduct } from '@/lib/firestore-admin'
import { Product } from '@/lib/types'
import { Plus, Edit, Trash2, X, Save, Loader2 } from 'lucide-react'

export default function AdminUrunlerPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: '',
    features: '',
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    try {
      const features = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : []

      await addProduct({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        features: features.length > 0 ? features : undefined,
      })

      setShowAddModal(false)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Ürün eklenirken bir hata oluştu')
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      const features = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : []

      await updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        features: features.length > 0 ? features : undefined,
      })

      setEditingProduct(null)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Ürün güncellenirken bir hata oluştu')
    }
  }

  const handleUpdatePrice = async (productId: string, newPrice: string) => {
    try {
      const price = parseFloat(newPrice)
      if (isNaN(price)) {
        alert('Geçerli bir fiyat giriniz')
        return
      }
      await updateProductPrice(productId, price)
      loadProducts()
    } catch (error) {
      console.error('Error updating price:', error)
      alert('Fiyat güncellenirken bir hata oluştu')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return

    try {
      await deleteProduct(productId)
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ürün silinirken bir hata oluştu')
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl || '',
      price: product.price?.toString() || '',
      features: product.features?.join(', ') || '',
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      imageUrl: '',
      price: '',
      features: '',
    })
  }

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-primary-600 hover:text-primary-700 mb-2"
              >
                ← Geri
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Ürün Ekle
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriceEditor
                          productId={product.id}
                          currentPrice={product.price}
                          onUpdate={handleUpdatePrice}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <ProductModal
            title="Yeni Ürün Ekle"
            formData={formData}
            setFormData={setFormData}
            onSave={handleAddProduct}
            onClose={() => {
              setShowAddModal(false)
              resetForm()
            }}
          />
        )}

        {/* Edit Modal */}
        {editingProduct && (
          <ProductModal
            title="Ürünü Düzenle"
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateProduct}
            onClose={() => {
              setEditingProduct(null)
              resetForm()
            }}
          />
        )}
      </div>
    </AdminRoute>
  )
}

function PriceEditor({
  productId,
  currentPrice,
  onUpdate,
}: {
  productId: string
  currentPrice?: number
  onUpdate: (id: string, price: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(currentPrice?.toString() || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(productId, price)
    setSaving(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="0.00"
          step="0.01"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-green-600 hover:text-green-700"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => {
            setEditing(false)
            setPrice(currentPrice?.toString() || '')
          }}
          className="text-gray-600 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-900 font-medium">
        {currentPrice ? `${currentPrice.toFixed(2)} ₺` : 'Fiyat yok'}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="text-primary-600 hover:text-primary-700"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  )
}

function ProductModal({
  title,
  formData,
  setFormData,
  onSave,
  onClose,
}: {
  title: string
  formData: any
  setFormData: (data: any) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Özellikler (virgülle ayırın)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Özellik 1, Özellik 2, Özellik 3"
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
