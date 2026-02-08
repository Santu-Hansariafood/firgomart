'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2, Gift } from 'lucide-react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { CartItem } from '@/types/checkout'
import { useCartSummary } from '@/hooks/cart/useCartSummary'
import { getMaxQuantity } from '@/utils/productUtils'

interface CartProps {
  items: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: number | string, newQuantity: number) => void
  onRemoveItem: (id: number | string) => void
}

const Cart: React.FC<CartProps> = ({ items, onClose, onUpdateQuantity, onRemoveItem }) => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { orderSummary } = useCartSummary(items)

  const localTotal = items.reduce((sum, item) => {
    if ((item.stock ?? 0) <= 0) return sum
    return sum + item.price * (item.quantity ?? 1)
  }, 0)

  const finalSubtotal = orderSummary?.subtotal ?? localTotal
  const finalTotal = orderSummary?.total ?? localTotal
  const taxAmount = orderSummary?.tax ?? 0

  const uniqueTaxRates = orderSummary?.items 
    ? Array.from(new Set(orderSummary.items.map((i: any) => i.gstPercent))) 
    : []
  const taxLabel = uniqueTaxRates.length === 1 
    ? `Tax (GST ${uniqueTaxRates[0]}%)` 
    : 'Tax (GST)'
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
          <div className="flex items-center justify-between p-5 border-b border-[var(--foreground)/10] bg-linear-to-r from-brand-purple/5 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-purple/10 rounded-full">
                <ShoppingBag className="w-5 h-5 text-brand-purple" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-[color:var(--foreground)]">Shopping Cart</h2>
                <p className="text-xs text-[var(--foreground)/60]">{items.length} items in cart</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--foreground)/10] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--background)]">
              <div className="w-24 h-24 bg-[var(--foreground)/5] rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-[var(--foreground)/20]" />
              </div>
              <h3 className="text-xl font-bold text-[color:var(--foreground)] mb-2">Your cart is empty</h3>
              <p className="text-[var(--foreground)/60] mb-8 max-w-[200px]">Looks like you haven't added anything to your cart yet.</p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-brand-purple text-white rounded-xl font-medium shadow-lg shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all hover:scale-105 active:scale-95"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]">
                {items.map((item) => {
                  const summaryItem = orderSummary?.items?.find((si: any) => String(si.productId) === String(item.id))
                  const maxQty = getMaxQuantity(item.price)
                  return (
                  <motion.div
                    key={item._uniqueId || item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="group relative flex space-x-4 bg-[var(--card-bg,var(--background))] rounded-xl p-3 border border-[var(--foreground)/5] shadow-sm hover:shadow-md transition-all hover:border-brand-purple/20"
                  >
                    <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-[var(--foreground)/5]">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-sm font-semibold text-[color:var(--foreground)] line-clamp-2 leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => onRemoveItem(item._uniqueId || item.id)}
                            className="text-[var(--foreground)/40] hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {item.appliedOffer && (
                          <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-xs font-medium text-green-600 dark:text-green-400">
                            <Gift className="w-3 h-3 mr-1" />
                            {item.appliedOffer.name} 
                            {item.appliedOffer.value ? ` (${item.appliedOffer.value}${item.appliedOffer.type.includes('discount') ? '% OFF' : ''})` : ''}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-end justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-bold text-[color:var(--foreground)]">₹{item.price}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-[var(--foreground)/40] line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>
                          {typeof item.unitsPerPack === 'number' && item.unitsPerPack > 1 && (
                            <span className="text-[10px] text-[var(--foreground)/50]">Pack of {item.unitsPerPack}</span>
                          )}
                        </div>

                        <div className="flex items-center bg-[var(--foreground)/5] rounded-lg p-1">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item._uniqueId || item.id, Math.max(1, (item.quantity ?? 1) - 1))
                            }
                            disabled={(summaryItem?.stock ?? item.stock ?? 0) <= 0}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black/20 text-[var(--foreground)] disabled:opacity-30 transition-shadow shadow-sm"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-[var(--foreground)]">
                            {item.quantity ?? 1}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item._uniqueId || item.id, Math.min((summaryItem?.stock ?? item.stock ?? maxQty), Math.min(maxQty, (item.quantity ?? 1) + 1)))}
                            className={`w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black/20 text-[var(--foreground)] transition-shadow shadow-sm ${((item.quantity ?? 1) >= maxQty || (summaryItem?.stock ?? item.stock ?? 0) <= (item.quantity ?? 0) || (summaryItem?.stock ?? item.stock ?? 0) <= 0) ? 'opacity-30 cursor-not-allowed' : ''}`}
                            disabled={(item.quantity ?? 1) >= maxQty || (summaryItem?.stock ?? item.stock ?? 0) <= (item.quantity ?? 0) || (summaryItem?.stock ?? item.stock ?? 0) <= 0}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      {((summaryItem?.stock ?? item.stock ?? 0) <= 0 || (summaryItem?.stock ?? item.stock ?? 999) < (item.quantity ?? 1)) && (
                        <div className="mt-2 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded">
                          Only {summaryItem?.stock ?? item.stock ?? 0} left in stock
                        </div>
                      )}
                    </div>
                  </motion.div>
                )})}
              </div>
              
              <div className="border-t border-[var(--foreground)/10] bg-[var(--background)] p-5 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--foreground)/60]">Subtotal</span>
                    <span className="font-medium text-[var(--foreground)]">₹{finalSubtotal.toFixed(2)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--foreground)/60]">{taxLabel}</span>
                      <span className="font-medium text-[var(--foreground)]">₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded">
                      <span>Total Savings</span>
                      <span className="font-bold">-₹{savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--foreground)/60]">Delivery</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="pt-3 mt-1 border-t border-[var(--foreground)/10] flex justify-between items-end">
                    <span className="font-heading font-bold text-[color:var(--foreground)] text-lg">Total Amount</span>
                    <span className="font-sans font-extrabold text-[color:var(--foreground)] text-2xl">
                        {"\u20B9"}{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={items.some(item => {
                    const sItem = orderSummary?.items?.find((si: any) => String(si.productId) === String(item.id))
                    const stock = sItem?.stock ?? item.stock ?? 0
                    return stock < (item.quantity ?? 1)
                  })}
                  className={`w-full py-4 rounded-xl transition-all font-bold text-lg shadow-lg active:scale-[0.98] ${
                    items.some(item => {
                      const sItem = orderSummary?.items?.find((si: any) => String(si.productId) === String(item.id))
                      const stock = sItem?.stock ?? item.stock ?? 0
                      return stock < (item.quantity ?? 1)
                    })
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-linear-to-r from-brand-purple to-brand-red text-white hover:from-brand-purple/90 hover:to-brand-red/90 shadow-brand-purple/25'
                  }`}
                >
                  Proceed to Checkout
                </button>
                <p className="text-xs text-center text-[var(--foreground)/40]">
                  Secure Checkout powered by Razorpay and Cashfree
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Cart
