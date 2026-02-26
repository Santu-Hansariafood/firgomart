'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, ChevronRight, ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCart } from '@/context/CartContext/CartContext'

import { getProductPath } from '@/utils/productUtils'

const ProductGrid = dynamic(() => import('@/components/ui/ProductGrid/ProductGrid'))
const Cart = dynamic(() => import('@/components/ui/Cart/Cart'))

export default function NewArrivalsPage() {
  const router = useRouter()
  const { cartItems, addToCart, updateQuantity, removeFromCart, showCart, setShowCart } = useCart()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [])

  const handleAddToCart = (product: any) => {
    addToCart(product)
    setShowCart(true)
  }

  const handleProductClick = (product: any) => {
    router.push(getProductPath(product.name, product._id || product.id))
  }

  return (
    <div className="min-h-screen bg-background pt-4 sm:pt-6 pb-12">
      <div className="container mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <nav className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-sm font-medium overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-hide">
            <Link href="/" className="flex items-center gap-1 text-foreground/60 hover:text-brand-purple shrink-0">
              <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-3.5 text-foreground/30 shrink-0" />
            <span className="text-brand-purple font-bold shrink-0">New Arrivals</span>
          </nav>

          <Link 
            href="/"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple rounded-full text-[9px] sm:text-xs font-bold transition-all shrink-0 border border-brand-purple/20 shadow-sm"
          >
            <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Home</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-4xl font-heading font-bold mb-6 sm:mb-8 text-foreground/90">
          New Arrivals
        </h1>
        <ProductGrid 
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          newArrivals={true}
        />
      </div>

      {showCart && (
        <Cart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
        />
      )}
    </div>
  )
}
