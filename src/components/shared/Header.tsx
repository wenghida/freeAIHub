'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Sparkles } from 'lucide-react'

const navigation = [
  { name: 'Text to Image', href: '/text-to-image' },
  { name: 'Text to Text', href: '/text-to-text' },
  { name: 'Text to Speech', href: '/text-to-speech' },
  { name: 'Speech to Text', href: '/speech-to-text' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Sparkles className="h-6 w-6 text-purple-600" />
              FreeAI Hub
            </span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-purple-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            href="https://github.com/pollinations/pollinations"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-purple-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </div>
      </nav>
      
      {/* 移动端菜单 */}
      <div className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50"></div>
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Sparkles className="h-6 w-6 text-purple-600" />
                FreeAI Hub
              </span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <Link
                  href="https://github.com/pollinations/pollinations"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}