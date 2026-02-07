'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Gift, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Product } from '@/types/product'

interface ProductInfoProps {
  product: Product
  selectedColor: string
  setSelectedColor: (color: string) => void
  selectedSize: string
  setSelectedSize: (size: string) => void
  quantity: number
  handleQuantityChange: (type: 'inc' | 'dec') => void
  handleBuyNow: () => void
  maxQty: number
}

const ProductInfo = memo(({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  handleQuantityChange,
  handleBuyNow,
  maxQty
}: ProductInfoProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {product.brand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-purple/5 text-brand-purple border border-brand-purple/20 text-xs font-bold tracking-wide uppercase">
              {product.brand}
            </span>
          )}
          {product.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-medium">
              {product.category}
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight text-gray-900 dark:text-gray-50">
          {product.name}
        </h2>
      </div>

      <div className="flex items-end gap-3 mb-6 p-4 rounded-2xl bg-foreground/5 border border-foreground/5 dark:bg-white/5 dark:border-white/10">
        <span className="text-3xl sm:text-4xl font-extrabold text-foreground dark:text-white">₹{product.price}</span>
        {product.originalPrice && (
          <span className="text-lg text-foreground/40 dark:text-white/40 line-through mb-1.5 font-medium">
            ₹{product.originalPrice}
          </span>
        )}
        {product.discount && (
          <span className="ml-auto text-green-600 dark:text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
            {product.discount}% Save
          </span>
        )}
      </div>

      {product.appliedOffer && (
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-purple via-pink-500 to-indigo-600 p-[1px] shadow-xl">
          <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl rounded-[15px] p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2 bg-brand-purple text-white rounded-lg shadow-lg shadow-brand-purple/30 shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-purple dark:text-violet-300 uppercase tracking-wider mb-0.5">Special Offer Applied</p>
                <p className="font-bold text-foreground dark:text-white text-lg">
                  {product.appliedOffer.name}
                </p>
                {product.appliedOffer.value && (
                  <p className="text-sm font-medium text-foreground/70 dark:text-white/70 mt-0.5">
                    Get <span className="text-brand-purple dark:text-violet-300 font-bold">{product.appliedOffer.value}{product.appliedOffer.type.includes('discount') ? '% OFF' : ''}</span> instantly
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(product.colors && product.colors.length > 0) && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wide mb-3">Select Color</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedColor(c)}
                className={`group relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedColor === c
                    ? 'bg-foreground text-background shadow-lg scale-105'
                    : 'bg-background border border-foreground/20 hover:border-brand-purple'
                }`}
              >
                {c}
                {selectedColor === c && (
                  <motion.div layoutId="colorCheck" className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {(product.sizes && product.sizes.length > 0) && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wide mb-3">Select Size</h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSize(s)}
                className={`group relative min-w-[3rem] px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedSize === s
                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 scale-105'
                    : 'bg-background border border-foreground/20 hover:border-brand-purple'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
        <div className="flex items-center bg-foreground/5 dark:bg-white/5 rounded-xl p-1 w-fit">
          <button
            onClick={() => handleQuantityChange('dec')}
            disabled={quantity <= 1}
            className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-sm transition-all ${
              quantity <= 1
                ? 'text-foreground/30 dark:text-white/30 cursor-not-allowed'
                : 'hover:bg-background text-foreground dark:text-white'
            }`}
          >
            -
          </button>
          <span className="w-12 text-center font-bold text-foreground dark:text-white">{quantity}</span>
          <button
            onClick={() => handleQuantityChange('inc')}
            disabled={quantity >= Math.min(maxQty, product.stock || 10)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-sm transition-all ${
              quantity >= Math.min(maxQty, product.stock || 10)
                ? 'text-foreground/30 dark:text-white/30 cursor-not-allowed'
                : 'hover:bg-background text-foreground dark:text-white'
            }`}
          >
            +
          </button>
        </div>

        <button
          onClick={handleBuyNow}
          disabled={(product.stock ?? 0) <= 0}
          className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
            (product.stock ?? 0) > 0
              ? 'bg-gradient-to-r from-brand-purple to-indigo-600 shadow-brand-purple/25'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {(product.stock ?? 0) > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-foreground/5">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase text-foreground/60">Secure Payment</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase text-foreground/60">Fast Delivery</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2 bg-brand-purple/10 text-brand-purple dark:text-violet-300 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase text-foreground/60">Quality Check</span>
        </div>
      </div>
    </div>
  )
})

ProductInfo.displayName = 'ProductInfo'

export default ProductInfo
