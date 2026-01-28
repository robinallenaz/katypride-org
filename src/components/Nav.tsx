'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cloudinaryLoader } from '@/lib/cloudinary'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/events', label: 'Events' },
  { href: '/advocacy', label: 'Advocacy' },
  { href: '/education', label: 'Education' },
  { href: '/pride-celebration', label: 'Pride Celebration' },
  { href: '/resources', label: 'Resources' },
  { href: '/news', label: 'News' },
]

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              loader={cloudinaryLoader}
              src="65ad7fd64707829ac5cdbe0d_epa64u"
              alt="Katy Pride Logo"
              width={64}
              height={64}
              className="rounded-full"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
            <span className="text-xl font-bold text-purple-600">Katy Pride</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-purple-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
