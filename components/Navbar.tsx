'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import NavbarLogo from './NavbarLogo'
import { productCategories, Category } from '@/lib/product-categories'

interface SubMenuItem {
  href: string
  label: string
}

interface NavItem {
  href: string
  label: string
  submenu?: SubMenuItem[]
}

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showProductsMenu, setShowProductsMenu] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Menü açıldığında ilk kategoriyi seç
  useEffect(() => {
    if (showProductsMenu && !hoveredCategory && productCategories.length > 0) {
      setHoveredCategory(productCategories[0].slug)
    }
  }, [showProductsMenu, hoveredCategory])

  // Ürünler dropdown menüsü için kategorileri hazırla
  const productSubmenu: SubMenuItem[] = productCategories.map((category) => ({
    href: `/urunler/${category.slug}`,
    label: category.title,
  }))

  const navItems: NavItem[] = [
    { href: '/', label: 'Ana Sayfa' },
    { 
      href: '/urunler', 
      label: 'Ürünler',
      submenu: productSubmenu
    },
    { href: '/hizmetler', label: 'Hizmetler' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/referanslar', label: 'Referanslar' },
    { href: '/iletisim', label: 'İletişim' },
  ]

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
            <NavbarLogo />
            <span className="text-xl font-bold">Emir Tuning</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-4 items-center">
            <div className="flex gap-6">
            {navItems.map((item) => {
              if (item.submenu) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setShowProductsMenu(true)}
                    onMouseLeave={() => setShowProductsMenu(false)}
                  >
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                        pathname === item.href || pathname.startsWith('/urunler')
                          ? 'text-white bg-gray-800'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProductsMenu ? 'rotate-180' : ''}`} />
                    </Link>
                    
                    {/* Mega Menu - Boşluğu kapatmak için biraz yukarı alıyoruz */}
                    {showProductsMenu && (
                      <div 
                        className="absolute top-[calc(100%-4px)] left-0 bg-white rounded-md shadow-xl border border-gray-200 z-[100]"
                        onMouseEnter={() => setShowProductsMenu(true)}
                        onMouseLeave={() => {
                          setShowProductsMenu(false)
                          setHoveredCategory(null)
                        }}
                        style={{ width: '1000px', maxHeight: '85vh' }}
                      >
                        <div className="flex h-full">
                          {/* Sol taraf - Ana kategoriler */}
                          <div className="w-56 border-r border-gray-200 bg-gray-50">
                            <div className="px-4 py-3 bg-primary-600">
                              <h3 className="text-sm font-semibold text-white">Kategoriler</h3>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
                              {productCategories.map((category) => (
                                <div
                                  key={category.slug}
                                  onMouseEnter={() => setHoveredCategory(category.slug)}
                                  className={`px-4 py-3 text-sm transition-all cursor-pointer border-l-2 ${
                                    hoveredCategory === category.slug
                                      ? 'bg-white text-primary-600 font-semibold border-primary-600'
                                      : pathname === `/urunler/${category.slug}` || pathname.startsWith(`/urunler/${category.slug}/`)
                                      ? 'bg-white text-primary-600 border-primary-400'
                                      : 'text-gray-700 hover:bg-white hover:text-primary-600 border-transparent'
                                  }`}
                                >
                                  <Link 
                                    href={`/urunler/${category.slug}`}
                                    onClick={() => setShowProductsMenu(false)}
                                    className="block"
                                  >
                                    {category.title}
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Sağ taraf - Alt kategoriler */}
                          {hoveredCategory && (() => {
                            const selectedCategory = productCategories.find(cat => cat.slug === hoveredCategory)
                            // Alt kategorisi olmayan kategoriler için sağ paneli gösterme
                            if (!selectedCategory || !selectedCategory.children || selectedCategory.children.length === 0) {
                              return null
                            }
                            
                            // Alt kategorileri sütunlara böl (3 sütun)
                            const columns: Category[][] = [[], [], []]
                            selectedCategory.children.forEach((child, index) => {
                              columns[index % 3].push(child)
                            })

                            return (
                              <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ maxHeight: '85vh' }}>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                    {selectedCategory.title}
                                  </h4>
                                  <div className="grid grid-cols-3 gap-8">
                                    {columns.map((column, colIndex) => (
                                      <div key={colIndex} className="space-y-0">
                                        {column.map((subCategory) => (
                                          <div key={subCategory.slug} className="mb-3">
                                            <Link
                                              href={`/urunler/${selectedCategory.slug}/${subCategory.slug}`}
                                              onClick={() => setShowProductsMenu(false)}
                                              className={`block py-1.5 text-sm font-semibold transition-colors mb-1 ${
                                                pathname === `/urunler/${selectedCategory.slug}/${subCategory.slug}` || 
                                                pathname.startsWith(`/urunler/${selectedCategory.slug}/${subCategory.slug}/`)
                                                  ? 'text-primary-600'
                                                  : 'text-gray-900 hover:text-primary-600'
                                              }`}
                                            >
                                              {subCategory.title}
                                            </Link>
                                            
                                            {/* Alt-alt kategoriler (3. seviye) */}
                                            {subCategory.children && subCategory.children.length > 0 && (
                                              <div className="ml-0 mt-1 space-y-0.5">
                                                {subCategory.children.map((subSubCategory) => (
                                                  <Link
                                                    key={subSubCategory.slug}
                                                    href={`/urunler/${selectedCategory.slug}/${subCategory.slug}/${subSubCategory.slug}`}
                                                    onClick={() => setShowProductsMenu(false)}
                                                    className={`block py-1 text-xs transition-colors pl-2 ${
                                                      pathname === `/urunler/${selectedCategory.slug}/${subCategory.slug}/${subSubCategory.slug}` ||
                                                      pathname.startsWith(`/urunler/${selectedCategory.slug}/${subCategory.slug}/${subSubCategory.slug}/`)
                                                        ? 'text-primary-600 font-medium'
                                                        : 'text-gray-600 hover:text-primary-600'
                                                    }`}
                                                  >
                                                    • {subSubCategory.title}
                                                  </Link>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                          
                          {!hoveredCategory && (
                            <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ maxHeight: '85vh' }}>
                              <div className="text-center py-12 text-gray-400">
                                <p className="text-sm">Bir kategori seçin</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-white bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:bg-gray-800"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            {navItems.map((item) => {
              if (item.submenu) {
                return (
                  <div key={item.href}>
                    <div className="px-3 py-2 text-base font-medium text-gray-300">
                      {item.label}
                    </div>
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-6 py-2 rounded-md text-sm ${
                          pathname === subItem.href
                            ? 'text-white bg-gray-800'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? 'text-white bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
