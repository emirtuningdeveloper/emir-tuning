'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Search, X, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import NavbarLogo from './NavbarLogo'
import { productCategories, Category } from '@/lib/product-categories'
import { ProductSearchIndex } from '@/lib/types'

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
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showProductsMenu, setShowProductsMenu] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProductSearchIndex[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)

  // Menü açıldığında ilk kategoriyi seç
  useEffect(() => {
    if (showProductsMenu && !hoveredCategory && productCategories.length > 0) {
      setHoveredCategory(productCategories[0].slug)
    }
  }, [showProductsMenu, hoveredCategory])

  // Arama fonksiyonu
  const handleSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search-products?q=${encodeURIComponent(query)}&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results || [])
        setShowSearchResults(true)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setShowSearchResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Arama sonucuna tıklandığında kategori sayfasına yönlendir
  const handleSearchResultClick = (result: ProductSearchIndex) => {
    setSearchQuery('')
    setShowSearchResults(false)
    router.push(`/urunler/${result.categoryPath}`)
  }

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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <NavbarLogo />
            <span className="text-xl font-bold">Emir Tuning</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-4 items-center">
            {/* Arama Kutusu */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSearchResults(true)
                    }
                  }}
                  className="bg-transparent border-none outline-none text-sm w-48 focus:w-64 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearchResults(false)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                )}
              </div>

              {/* Arama Sonuçları */}
              {showSearchResults && (searchResults.length > 0 || searchQuery.length >= 2) && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-[200] max-h-96 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Aranıyor...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="p-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">
                          {searchResults.length} sonuç bulundu
                        </p>
                      </div>
                      <div className="py-2">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleSearchResultClick(result)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {result.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {result.categoryLabel}
                            </p>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Sonuç bulunamadı</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Menü Öğeleri */}
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
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
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
          <div className="md:hidden py-4 border-t">
            {navItems.map((item) => {
              if (item.submenu) {
                return (
                  <div key={item.href}>
                    <div className="px-3 py-2 text-base font-medium text-gray-700">
                      {item.label}
                    </div>
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-6 py-2 rounded-md text-sm ${
                          pathname === subItem.href
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
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
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
