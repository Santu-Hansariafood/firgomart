"use client"

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { Product } from '@/types/product'
import { sanitizeImageUrl, formatPrice } from '@/utils/productUtils'
import { Share2, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const ProductImageSlider = dynamic(() => import('@/components/common/ProductImageSlider/ProductImageSlider'))

interface ProductCardProps {
  product: Product
  onProductClick: (product: Product) => void
  onAddToCart?: (product: Product) => void
  priority?: boolean
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, onAddToCart, priority = false }) => {
  const { data: session } = useSession()

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/product/${product._id || product.id}`
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on FirgoMart!`,
        url
      }).catch((err) => {
        console.error('Error sharing:', err)
        if (err.name !== 'AbortError') {
          toast.error('Failed to share product')
        }
      })
    } else {
      navigator.clipboard.writeText(url)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'))
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user) {
      toast.error('Please login to save products')
      return
    }

    try {
      const res = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id || product.id })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist')
      } else {
        toast.error(data?.error || 'Failed to update wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900/50 h-full"
    >
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleWishlist}
          className="p-2 bg-white/90 dark:bg-black/80 rounded-full shadow-lg hover:scale-110 transition-transform text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500"
          title="Add to Wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
        <button
          onClick={handleShare}
          className="p-2 bg-white/90 dark:bg-black/80 rounded-full shadow-lg hover:scale-110 transition-transform text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500"
          title="Share Product"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div 
        className="relative aspect-[4/5] cursor-pointer overflow-hidden"
        onClick={() => onProductClick(product)}
      >
        <ProductImageSlider
          images={
            product.images && product.images.length > 0
              ? product.images.map(sanitizeImageUrl)
              : [sanitizeImageUrl(product.image)]
          }
          name={product.name}
          interval={2500}
        />
        
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {(typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo') ? (
          <span className={`absolute bottom-3 left-3 right-3 md:bottom-auto md:left-3 md:right-auto text-center md:text-left bg-white/95 dark:bg-violet-600/90 backdrop-blur-md text-violet-700 dark:text-white text-[10px] font-bold px-2 py-1.5 rounded-xl md:rounded-lg shadow-lg z-20 border border-violet-200/50 dark:border-violet-500/50 ${product.discount ? 'md:top-12' : 'md:top-3'}`}>
            {product.name.toLowerCase().includes('combo') ? '✨ COMBO' : `📦 PACK OF ${product.unitsPerPack}`}
          </span>
        ) : null}

        {product.discount && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg z-20">
            {product.discount}% OFF
          </span>
        )}

        <div className="hidden md:flex absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex-col justify-end h-full pointer-events-none">
          <div className="pointer-events-auto">
            <p className="text-[10px] font-bold text-brand-purple mb-1 uppercase tracking-wider bg-white/90 dark:bg-black/80 inline-block px-2 py-0.5 rounded-full backdrop-blur-sm">
              {product.category}
            </p>
            
            <h3 
              className="text-sm font-bold text-white leading-snug line-clamp-2 mb-2 drop-shadow-md"
              title={product.name}
            >
              {product.name}
            </h3>

            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-white">₹{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-white/60 line-through font-medium">₹{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
              </div>
              
              {(product.rating || 0) > 0 && (
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-[10px] font-bold text-white">{product.rating}</span>
                  <span className="text-[9px] text-white/60">({product.reviews})</span>
                </div>
              )}
            </div>

            {onAddToCart && (
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   onAddToCart(product)
                 }}
                 className="w-full mt-3 py-2 bg-brand-purple text-white text-xs font-bold rounded-lg hover:bg-brand-purple/90 transition-colors active:scale-95 shadow-lg"
               >
                 Add to Cart
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="md:hidden p-3 flex flex-col gap-1.5">
        <p className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">
          {product.category}
        </p>
        <div className="h-10">
          <h3 
            className="text-sm font-bold text-foreground leading-snug line-clamp-2 cursor-pointer"
            onClick={() => onProductClick(product)}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-foreground">₹{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-foreground/40 line-through font-medium">MRP ₹{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {(product.rating || 0) > 0 ? (
              <>
                <div className="flex text-brand-purple text-xs">
                  {"★".repeat(Math.round(product.rating || 0))}
                  <span className="text-gray-300">{"★".repeat(5 - Math.round(product.rating || 0))}</span>
                </div>
                <span className="text-[10px] text-foreground/40">({product.reviews || 0})</span>
              </>
            ) : (
              <span className="text-[10px] text-foreground/40">No ratings</span>
            )}
          </div>
        </div>
        
        {onAddToCart && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            className="w-full mt-2 py-2 bg-brand-purple text-white text-xs font-bold rounded-lg hover:bg-brand-purple/90 transition-colors active:scale-95"
          >
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default ProductCard
