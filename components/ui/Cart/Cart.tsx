'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useAuth } from '@/context/AuthContext'

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  quantity?: number
  image: string
  stock?: number
  unitsPerPack?: number
  selectedSize?: string
  selectedColor?: string
  _uniqueId?: string
}

interface CartProps {
  items: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: number | string, newQuantity: number) => void
  onRemoveItem: (id: number | string) => void
}

const Cart: React.FC<CartProps> = ({ items, onClose, onUpdateQuantity, onRemoveItem }) => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const total = items.reduce((sum, item) => {
    if ((item.stock ?? 0) <= 0) return sum
    return sum + item.price * (item.quantity ?? 1)
  }, 0)
  const savings = items.reduce((sum, item) => {
    if ((item.stock ?? 0) <= 0) return sum
    const saved = item.originalPrice ? (item.originalPrice - item.price) * (item.quantity ?? 1) : 0
    return sum + saved
  }, 0)

  const handleCheckout = () => {
    const validCount = items.filter(item => (item.stock ?? 0) > 0).length
    if (validCount === 0) return 

    onClose()
    if (!isAuthenticated) {
      router.push('/login?next=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--background)] text-[color:var(--foreground)] w-full md:w-96 h-[90vh] md:h-full md:max-h-screen flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-purple" />
              <h2 className="text-lg font-heading font-bold text-[color:var(--foreground)]">Shopping Cart</h2>
              <span className="text-sm text-gray-500">({items.length})</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add some products to get started</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-linear-to-r from-brand-purple to-brand-red text-white rounded-lg hover:from-brand-purple/90 hover:to-brand-red/90 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex space-x-3 bg-[var(--background)] rounded-lg p-3"
                  >
                    <div className="relative w-20 h-20 shrink-0">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[color:var(--foreground)] line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                      {typeof item.unitsPerPack === 'number' && item.unitsPerPack > 1 && (
                        <div className="text-xs text-gray-500 mb-1">Pack of {item.unitsPerPack}</div>
                      )}
                      <div className="flex items-baseline space-x-2 mb-2">
                        <span className="text-lg font-bold text-[color:var(--foreground)]">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>

                      {(item.stock ?? 0) <= 0 && (
                        <div className="mb-2">
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item._uniqueId || item.id, Math.max(1, (item.quantity ?? 1) - 1))
                            }
                            disabled={(item.stock ?? 0) <= 0}
                            className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity ?? 1}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item._uniqueId || item.id, Math.min((item.stock ?? 3), Math.min(3, (item.quantity ?? 1) + 1)))}
                            className={`w-6 h-6 border border-gray-300 rounded flex items-center justify-center transition-colors ${((item.quantity ?? 1) >= 3 || (item.stock ?? 0) <= (item.quantity ?? 0) || (item.stock ?? 0) <= 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
                            disabled={(item.quantity ?? 1) >= 3 || (item.stock ?? 0) <= (item.quantity ?? 0) || (item.stock ?? 0) <= 0}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item._uniqueId || item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Max 3 per product</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Savings</span>
                      <span className="font-medium">-₹{savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                    <span className="font-heading font-bold text-[color:var(--foreground)]">Total</span>
                    <span className="font-sans font-bold text-[color:var(--foreground)] text-lg">
                        {"\u20B9"}{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={items.every(item => (item.stock ?? 0) <= 0)}
                  className={`w-full py-3 rounded-lg transition-colors font-medium ${
                    items.every(item => (item.stock ?? 0) <= 0)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-linear-to-r from-brand-purple to-brand-red text-white hover:from-brand-purple/90 hover:to-brand-red/90'
                  }`}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Cart
