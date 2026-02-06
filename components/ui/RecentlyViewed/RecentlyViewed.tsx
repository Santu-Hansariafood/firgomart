'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import ProductImageSlider from '@/components/common/ProductImageSlider/ProductImageSlider'
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'
import { useSession } from 'next-auth/react'

interface Product {
  id: string | number
  name: string
  image: string
  images?: string[]
  category: string
  subcategory?: string
  price: number
  originalPrice?: number
  discount?: number
  rating?: number
  brand?: string
  colors?: string[]
  sizes?: string[]
  about?: string
  additionalInfo?: string
  description?: string
  reviews?: number
  stock?: number
  unitsPerPack?: number
  isAdminProduct?: boolean
  hsnCode?: string
}

interface RecentlyViewedProps {
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductClick, onAddToCart }) => {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const sanitizeImageUrl = (src: string) => (src || '').trim().replace(/[)]+$/g, '')
  const formatPrice = (v: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v)

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/history')
        .then(res => res.json())
        .then(data => {
            if (data.history) {
                // Map API data to Product interface if needed, but assuming structure matches roughly
                const mapped = data.history.map((p: any) => ({
                    id: p._id || p.id,
                    name: p.name,
                    image: sanitizeImageUrl(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || ''),
                    images: Array.isArray(p.images) ? p.images : undefined,
                    category: p.category,
                    subcategory: p.subcategory,
                    price: p.price,
                    originalPrice: p.originalPrice,
                    discount: p.discount,
                    rating: p.rating,
                    brand: p.brand,
                    colors: p.colors,
                    sizes: p.sizes,
                    about: p.about,
                    additionalInfo: p.additionalInfo,
                    description: p.description,
                    reviews: p.reviews,
                    stock: p.stock,
                    unitsPerPack: p.unitsPerPack,
                    isAdminProduct: p.isAdminProduct,
                    hsnCode: p.hsnCode,
                }))
                setProducts(mapped)
            }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
        setLoading(false)
    }
  }, [session])

  if (loading || products.length === 0) return null

  return (
    <section className="py-8 bg-background border-b border-foreground/10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground drop-shadow-md mb-4">My List (Recently Viewed)</h2>
        
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-4"
                style={{ width: 'max-content' }}
            >
                {products.map((product) => (
                <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    className="w-[160px] sm:w-[200px] bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[var(--foreground)/10] shrink-0"
                >
                    <div 
                    className="relative aspect-square sm:aspect-3/4 overflow-hidden bg-gray-100 group cursor-pointer"
                    onClick={() => onProductClick(product)}
                    >
                    <ProductImageSlider
                    images={
                        product.images && product.images.length > 0
                        ? product.images.map(sanitizeImageUrl)
                        : [sanitizeImageUrl(product.image)]
                    }
                    name={product.name}
                    interval={1800}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                        <Eye className="w-5 h-5 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] sm:text-[10px] font-semibold px-2 py-1 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-brand-purple/50 glow-effect glow-sm">
                        FirgoMart Product
                    </span>

                    {(typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo') ? (
                        <span className="absolute top-8 left-2 bg-purple-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                        {product.name.toLowerCase().includes('combo') ? 'COMBO OFFER' : `PACK OF ${product.unitsPerPack}`}
                        </span>
                    ) : null}

                    {product.discount && (
                        <span className="absolute top-2 right-2 bg-brand-red text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-red-500/50 glow-effect">
                        {product.discount}% OFF
                    </span>
                    )}
                    </div>
                    <div className="p-2 sm:p-4">
                    <h3 
                        className="text-[11px] sm:text-sm font-semibold text-foreground group-hover/card:text-brand-purple active:text-purple-700 transition-colors mb-1 leading-snug line-clamp-2 cursor-pointer"
                        onClick={() => onProductClick(product)}
                    >
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div>
                        <span className="text-sm sm:text-lg font-bold text-foreground">₹{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                            <span className="text-[11px] sm:text-sm text-foreground/50 line-through ml-2">₹{formatPrice(product.originalPrice)}</span>
                        )}
                        </div>
                        {typeof product.rating === "number" && (
                        <div className="flex items-center space-x-1">
                            <span className="text-brand-purple-500">★</span>
                            <span className="text-[10px] sm:text-sm text-foreground/60">{product.rating}</span>
                        </div>
                        )}
                    </div>
                    <div className="flex gap-1 sm:gap-1.5">
                        <button
                        onClick={() => onProductClick(product)}
                        className="hidden sm:inline-flex flex-1 px-3 py-2 border border-brand-purple text-brand-purple rounded-lg hover:bg-brand-purple/10 transition-colors text-sm font-medium items-center justify-center"
                        >
                        View
                        </button>
                        <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if ((product.stock ?? 0) > 0) {
                            onAddToCart(product)
                            }
                        }}
                        disabled={(product.stock ?? 0) <= 0}
                        className={`flex-1 px-2 py-2 sm:px-3 sm:py-2 rounded-lg transition-colors text-[11px] sm:text-sm font-medium flex items-center justify-center space-x-1 ${
                            (product.stock ?? 0) > 0
                            ? 'bg-brand-purple text-white hover:bg-brand-purple/90'
                            : 'bg-foreground/10 text-foreground/40 cursor-not-allowed'
                        }`}
                        >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Add</span>
                        </button>
                    </div>
                    </div>
                </motion.div>
                ))}
            </motion.div>
        </div>
      </div>
    </section>
  )
}

export default RecentlyViewed
