'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import NavbarLogo from './NavbarLogo'

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

  const navItems: NavItem[] = [
    { href: '/', label: 'Ana Sayfa' },
    { 
      href: '/urunler', 
      label: 'Ürünler',
      submenu: [
        { href: '/urunler', label: 'Body Kit' },
        { href: '/urunler/aksesuarlar', label: 'Aksesuarlar' },
      ]
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
          <div className="hidden md:flex gap-6">
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
                    
                    {/* Dropdown Menu - Boşluğu kapatmak için biraz yukarı alıyoruz */}
                    {showProductsMenu && (
                      <div className="absolute top-[calc(100%-4px)] left-0 w-56 bg-white rounded-md shadow-xl border border-gray-200 py-2 z-[100]">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setShowProductsMenu(false)}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              pathname === subItem.href
                                ? 'text-primary-600 bg-primary-50 font-semibold'
                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
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
