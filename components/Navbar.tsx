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
  const [categories, setCategories] = useState<Category[]>(productCategories)

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategories(data)
      })
      .catch(() => {})
  }, [])

  const productCategoriesList = categories

  // Menü açıldığında ilk kategoriyi seç
  useEffect(() => {
    if (showProductsMenu && !hoveredCategory && productCategoriesList.length > 0) {
      setHoveredCategory(productCategoriesList[0].slug)
    }
  }, [showProductsMenu, hoveredCategory, productCategoriesList])

  // Ürünler dropdown menüsü için kategorileri hazırla
  const productSubmenu: SubMenuItem[] = productCategoriesList.map((category) => ({
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
    <nav className="sticky top-0 z-50 bg-anthracite-900/95 backdrop-blur-md border-b border-white/5 shadow-nav">
      <div className="container mx-auto px-4 max-w-content">
        <div className="flex justify-between items-center h-[4.25rem]">
          <Link href="/" className="flex items-center text-white hover:text-white/90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite-900 rounded">
            <NavbarLogo />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-1 items-center">
            <div className="flex gap-1 items-center">
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
                      className={`px-4 py-2.5 rounded-button text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                        pathname === item.href || pathname.startsWith('/urunler')
                          ? 'text-white bg-white/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProductsMenu ? 'rotate-180' : ''}`} />
                    </Link>
                    
                    {/* Mega Menu */}
                    {showProductsMenu && (
                      <div 
                        className="absolute top-full left-0 pt-1 z-[100]"
                        onMouseEnter={() => setShowProductsMenu(true)}
                        onMouseLeave={() => {
                          setShowProductsMenu(false)
                          setHoveredCategory(null)
                        }}
                      >
                        <div 
                          className="bg-[#1a1a1a] rounded-card-lg shadow-dropdown border border-white/10 overflow-hidden"
                          style={{ width: '1000px', maxHeight: '85vh' }}
                        >
                          <div className="flex h-full">
                            {/* Sol - Ana kategoriler */}
                            <div className="w-56 border-r border-white/10 bg-black/30">
                              <div className="px-4 py-3 bg-anthracite-900">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Kategoriler</h3>
                              </div>
                              <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 52px)' }}>
                                {productCategoriesList.map((category) => (
                                  <div
                                    key={category.slug}
                                    onMouseEnter={() => setHoveredCategory(category.slug)}
                                    className={`px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer border-l-2 ${
                                      hoveredCategory === category.slug
                                        ? 'bg-white/10 text-primary-400 font-semibold border-primary-500'
                                        : pathname === `/urunler/${category.slug}` || pathname.startsWith(`/urunler/${category.slug}/`)
                                        ? 'bg-white/5 text-primary-400 border-primary-600'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-primary-400 border-transparent'
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

                            {/* Sağ - Alt kategoriler */}
                            {hoveredCategory && (() => {
                              const selectedCategory = productCategoriesList.find(cat => cat.slug === hoveredCategory)
                              if (!selectedCategory || !selectedCategory.children || selectedCategory.children.length === 0) {
                                return null
                              }
                              const columns: Category[][] = [[], [], []]
                              selectedCategory.children.forEach((child, index) => {
                                columns[index % 3].push(child)
                              })

                              return (
                                <div className="flex-1 px-6 py-5 overflow-y-auto" style={{ maxHeight: '85vh' }}>
                                  <h4 className="text-base font-bold text-white mb-4 pb-2 border-b border-white/10 tracking-tight">
                                    {selectedCategory.title}
                                  </h4>
                                  <div className="grid grid-cols-3 gap-x-10 gap-y-1">
                                    {columns.map((column, colIndex) => (
                                      <div key={colIndex} className="space-y-0">
                                        {column.map((subCategory) => (
                                          <div key={subCategory.slug} className="mb-3">
                                            <Link
                                              href={`/urunler/${selectedCategory.slug}/${subCategory.slug}`}
                                              onClick={() => setShowProductsMenu(false)}
                                              className={`block py-1.5 text-sm font-medium transition-colors duration-150 ${
                                                pathname === `/urunler/${selectedCategory.slug}/${subCategory.slug}` || 
                                                pathname.startsWith(`/urunler/${selectedCategory.slug}/${subCategory.slug}/`)
                                                  ? 'text-primary-400'
                                                  : 'text-gray-300 hover:text-primary-400'
                                              }`}
                                            >
                                              {subCategory.title}
                                            </Link>
                                            {subCategory.children && subCategory.children.length > 0 && (
                                              <div className="ml-0 mt-1 space-y-0.5">
                                                {subCategory.children.map((subSubCategory) => (
                                                  <Link
                                                    key={subSubCategory.slug}
                                                    href={`/urunler/${selectedCategory.slug}/${subCategory.slug}/${subSubCategory.slug}`}
                                                    onClick={() => setShowProductsMenu(false)}
                                                    className={`block py-1 text-xs transition-colors duration-150 pl-2 ${
                                                      pathname === `/urunler/${selectedCategory.slug}/${subCategory.slug}/${subSubCategory.slug}` ||
                                                      pathname.startsWith(`/urunler/${selectedCategory.slug}/${subCategory.slug}/${subSubCategory.slug}/`)
                                                        ? 'text-primary-400 font-medium'
                                                        : 'text-gray-500 hover:text-primary-400'
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
                              )
                            })()}
                            
                            {!hoveredCategory && (
                              <div className="flex-1 px-6 py-5 flex items-center justify-center" style={{ maxHeight: '85vh' }}>
                                <p className="text-sm text-gray-500">Bir kategori seçin</p>
                              </div>
                            )}
                          </div>
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
                  className={`px-4 py-2.5 rounded-button text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite-900`}
                >
                  {item.label}
                </Link>
              )
            })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-button text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
          <div className="md:hidden py-4 border-t border-white/10">
            {navItems.map((item) => {
              if (item.submenu) {
                return (
                  <div key={item.href}>
                    <div className="px-4 py-2 text-sm font-medium text-gray-400">
                      {item.label}
                    </div>
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-6 py-2.5 rounded-button text-sm transition-colors duration-200 ${
                          pathname === subItem.href
                            ? 'text-white bg-white/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                  className={`block px-4 py-2.5 rounded-button text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
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
