"use client"

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { Product } from '@/types/product'
import { sanitizeImageUrl, formatPrice, getProductPath } from '@/utils/productUtils'
import { Share2, Heart, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const ProductImageSlider = dynamic(() => import('@/components/common/ProductImageSlider/ProductImageSlider'))

interface ProductCardProps {
  product: Product
  onProductClick: (product: Product) => void
  onAddToCart?: (product: Product) => void
  priority?: boolean
  onWishlistToggle?: (product: Product, added: boolean) => void
  compact?: boolean
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- priority reserved for image loading
const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, onAddToCart, priority = false, onWishlistToggle, compact = false }) => {
  const { data: session } = useSession()

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}${getProductPath(product.name, product._id || product.id)}`
    
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
        if (onWishlistToggle) {
          onWishlistToggle(product, data.added)
        }
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
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900/50 h-full flex flex-col border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-300"
    >
      {/* Action buttons - mobile: compact & always visible; desktop: on hover */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex flex-col gap-1.5 sm:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleWishlist}
          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 flex items-center justify-center bg-white/95 dark:bg-black/80 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 touch-manipulation"
          title="Add to Wishlist"
          aria-label="Add to Wishlist"
        >
          <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
        <button
          onClick={handleShare}
          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 flex items-center justify-center bg-white/95 dark:bg-black/80 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 touch-manipulation"
          title="Share Product"
          aria-label="Share Product"
        >
          <Share2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      <div
        className="relative aspect-[3/4] sm:aspect-[4/5] cursor-pointer overflow-hidden rounded-t-2xl"
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

        <div className="hidden md:block absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Mobile: category + rating on photo */}
        <div className="md:hidden absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <span className="bg-white/95 dark:bg-black/70 backdrop-blur-md text-brand-purple text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm border border-foreground/10 max-w-[70%] truncate">
            {product.category}
          </span>
          {(product.rating || 0) > 0 && (
            <span className="flex items-center gap-1 bg-black/45 backdrop-blur-md text-white px-2 py-1 rounded-full shadow-sm border border-white/10 shrink-0">
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span className="text-[10px] font-bold leading-none">{product.rating}</span>
              <span className="text-[10px] text-white/70 leading-none">({product.reviews || 0})</span>
            </span>
          )}
        </div>

        {typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1 ? (
          <span className={`absolute bottom-12 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-auto md:bottom-auto md:left-3 md:right-auto text-center md:text-left bg-white/95 dark:bg-violet-600/90 backdrop-blur-md text-violet-700 dark:text-white text-[10px] font-bold px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl md:rounded-lg shadow-lg z-20 border border-violet-200/50 dark:border-violet-500/50 ${product.discount ? 'md:top-12' : 'md:top-3'}`}>
            {`PACK OF ${product.unitsPerPack}`}
          </span>
        ) : null}

        {product.discount && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg z-20">
            {product.discount}% OFF
          </span>
        )}

        {/* Desktop hover overlay content */}
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

      {/* Mobile & tablet: content below image */}
      {!compact && (
        <div className="md:hidden flex flex-col flex-1 p-3 sm:p-4 gap-2 min-h-0">
          <div className="flex items-end justify-between gap-2 mt-auto">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-base sm:text-lg font-extrabold text-foreground">₹{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-[11px] sm:text-xs text-foreground/50 line-through font-medium">MRP ₹{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <button
              onClick={() => onProductClick(product)}
              className="shrink-0 inline-flex items-center justify-center min-h-[40px] px-4 py-2 bg-brand-purple text-white text-xs sm:text-sm font-extrabold rounded-xl hover:bg-brand-purple/90 active:scale-[0.98] transition-all shadow-md touch-manipulation"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ProductCard
