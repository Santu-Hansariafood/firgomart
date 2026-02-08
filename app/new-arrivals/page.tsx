'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useCart } from '@/context/CartContext/CartContext'

const ProductGrid = dynamic(() => import('@/components/ui/ProductGrid/ProductGrid'))
const ProductModal = dynamic(() => import('@/components/ui/ProductModal/ProductModal'))
const Cart = dynamic(() => import('@/components/ui/Cart/Cart'))

export default function NewArrivalsPage() {
  const router = useRouter()
  const { cartItems, addToCart, updateQuantity, removeFromCart, showCart, setShowCart } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)

  const handleAddToCart = (product: any) => {
    addToCart(product)
    setShowCart(true)
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-8 text-foreground/90">
          New Arrivals
        </h1>
        <ProductGrid 
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          newArrivals={true}
        />
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

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
