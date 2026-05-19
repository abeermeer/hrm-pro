"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            HRM Pro
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#product" className="text-gray-600 hover:text-gray-900 transition-colors">Product</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Start Free →
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
          <a href="#features" className="block text-gray-600" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#product" className="block text-gray-600" onClick={() => setIsOpen(false)}>Product</a>
          <a href="#pricing" className="block text-gray-600" onClick={() => setIsOpen(false)}>Pricing</a>
          <a href="#faq" className="block text-gray-600" onClick={() => setIsOpen(false)}>FAQ</a>
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <Link href="/login" className="block text-gray-600" onClick={() => setIsOpen(false)}>Sign In</Link>
            <Link href="/signup" className="block bg-indigo-600 text-white px-4 py-2 rounded-lg text-center" onClick={() => setIsOpen(false)}>
              Start Free →
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
