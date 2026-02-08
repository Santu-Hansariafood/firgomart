'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, ShoppingBag, ShoppingCart } from 'lucide-react'
import dynamic from 'next/dynamic'
import OffersFilterChips from '@/components/ui/Filters/OffersFilterChips'
import { FilterControls, FilterPanel } from './ProductFilters'
import { Product } from '@/types/product'
import { useProductFilters } from '@/hooks/product-grid/useProductFilters'
import { useProductData } from '@/hooks/product-grid/useProductData'
import { useGeolocation } from '@/hooks/product-grid/useGeolocation'
import { getSizeOptionsForCategory, allSizes, subcategoryOptionsFor, sanitizeImageUrl, formatPrice } from '@/utils/productUtils'

const MarqueeBanner = dynamic(() => import('@/components/ui/MarqueeBanner/MarqueeBanner'))
const PriceCategoryBanner = dynamic(() => import('@/components/ui/PriceCategoryBanner/PriceCategoryBanner'))
const ProductImageSlider = dynamic(() => import('@/components/common/ProductImageSlider/ProductImageSlider'))

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

interface ProductGridProps {
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
  initialCategory?: string
  hideFilters?: boolean
  newArrivals?: boolean
}

const ProductGrid: React.FC<ProductGridProps> = ({ onProductClick, onAddToCart, initialCategory, hideFilters = false, newArrivals }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = (searchParams.get('search') || '').trim()
  const category = initialCategory || (searchParams.get('category') || '').trim()
  const subcategory = (searchParams.get('subcategory') || '').trim()

  const { deliverToState } = useGeolocation()
  
  const [page, setPage] = useState<number>(1)
  
  const filters = useProductFilters(setPage)
  
  const { 
    displayedProducts, 
    loading, 
    hasMore, 
    loadMore 
  } = useProductData({
    search, 
    category, 
    subcategory, 
    deliverToState, 
    page,
    setPage,
    ...filters,
    newArrivals
  })
  
  const observerTarget = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.5 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) observer.observe(currentTarget)

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
    }
  }, [loadMore])

  useEffect(() => {
    const opts = category ? subcategoryOptionsFor(category).map(o => o.label) : []
    if (!category && subcategory) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('subcategory')
      router.push(`/?${params.toString()}`, { scroll: false })
    } else if (subcategory && opts.length > 0 && !opts.includes(subcategory)) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('subcategory')
      router.push(`/?${params.toString()}`, { scroll: false })
    }
  }, [category, subcategory, searchParams, router])

  return (
    <section className="min-h-screen py-12 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-brand-purple/5 dark:bg-brand-purple/20 -skew-y-3 transform origin-top-left -z-10" />
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-rose-500/5 dark:bg-rose-500/20 rounded-full blur-[80px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 transform hover:scale-[1.01] transition-transform duration-500">
          <MarqueeBanner />
        </div>
        
        <div className="mb-12">
          <PriceCategoryBanner onSelectCategory={filters.handlePriceCategorySelect} />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          {!search && (
            <div className="space-y-2 relative w-full md:w-auto flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
                <span className="text-brand-purple">
                  Firgo
                </span>
                <span className="bg-clip-text text-red-500">
                  Mart
                </span>
                <span className="ml-2 text-brand-purple">
                  Products
                </span>
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-foreground/60 font-medium">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20 shadow-sm backdrop-blur-sm">
                  {displayedProducts.length} Premium Items
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Inventory
                </span>
              </div>
            </div>
          )}
          {!hideFilters && (
            <div className="w-full md:w-auto z-10">
              <FilterControls
                isFilterOpen={filters.isFilterOpen}
                setIsFilterOpen={filters.setIsFilterOpen}
                activeFilterTab={filters.activeFilterTab}
                setActiveFilterTab={filters.setActiveFilterTab}
                isSortDropdownOpen={filters.isSortDropdownOpen}
                setIsSortDropdownOpen={filters.setIsSortDropdownOpen}
                sortBy={filters.sortBy}
                setSortBy={filters.setSortBy}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                minRating={filters.minRating}
                selectedSize={filters.selectedSize}
                setPage={setPage}
              />
            </div>
          )}
        </div>

        {!hideFilters && (
          <AnimatePresence>
            {filters.selectedOfferDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="rounded-3xl p-[1px] bg-gradient-to-r from-brand-purple via-pink-500 to-indigo-600 shadow-2xl overflow-hidden"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-[23px] p-6 sm:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-purple/20 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -ml-12 -mb-12 group-hover:bg-indigo-500/20 transition-colors duration-700" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-brand-purple text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-purple/30">
                        Active Offer
                      </span>
                      <span className="text-foreground/60 text-sm font-medium border-l-2 border-foreground/10 pl-2">{filters.selectedOfferDetails.type}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{filters.selectedOfferDetails.name}</h3>
                    {filters.selectedOfferDetails.value && (
                      <p className="text-brand-purple font-semibold text-lg flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        {filters.selectedOfferDetails.type.includes('discount') 
                          ? `Get ${filters.selectedOfferDetails.value}% Instant Discount` 
                          : filters.selectedOfferDetails.value}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      filters.setSelectedOffer('')
                      filters.setSelectedOfferDetails(null)
                      setPage(1)
                    }}
                    className="p-2 rounded-full hover:bg-foreground/5 transition-colors group/close"
                  >
                    <X className="w-6 h-6 text-foreground/40 group-hover/close:text-brand-red transition-colors" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        )}

        {!hideFilters && (
          <div className="mb-10">
            <OffersFilterChips
              selectedOffer={filters.selectedOffer || undefined}
              onChange={(next, offer) => { 
                filters.setSelectedOffer(next || '')
                filters.setSelectedOfferDetails(offer || null)
                setPage(1) 
              }}
            />
          </div>
        )}

        {!hideFilters && filters.isFilterOpen && (
          <div className="mb-8">
            <FilterPanel
              activeFilterTab={filters.activeFilterTab}
              minPrice={filters.minPrice}
              setMinPrice={filters.setMinPrice}
              maxPrice={filters.maxPrice}
              setMaxPrice={filters.setMaxPrice}
              minRating={filters.minRating}
              setMinRating={filters.setMinRating}
              selectedSize={filters.selectedSize}
              setSelectedSize={filters.setSelectedSize}
              setPage={setPage}
              onClearFilters={filters.clearAllFilters}
              category={category}
              getSizeOptionsForCategory={getSizeOptionsForCategory}
              allSizes={allSizes}
            />
          </div>
        )}

        {category && subcategoryOptionsFor(category).length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-wrap gap-3">
              {subcategoryOptionsFor(category).map((opt, idx) => {
                const active = subcategory === opt.label
                return (
                  <button
                    key={`${String(opt.id)}-${idx}`}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('subcategory', opt.label)
                      router.push(`/?${params.toString()}`, { scroll: false })
                      setPage(1)
                    }}
                    className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 ${
                      active
                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 ring-2 ring-brand-purple ring-offset-2 ring-offset-background'
                        : 'bg-background border border-foreground/10 text-foreground/70 hover:border-brand-purple/40 hover:text-brand-purple hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('subcategory')
                  router.push(`/?${params.toString()}`, { scroll: false })
                  setPage(1)
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-sm font-medium bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {displayedProducts.length === 0 && loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 lg:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-background rounded-2xl overflow-hidden shadow-sm border border-foreground/5 relative aspect-[4/5]">
                <div className="absolute inset-0 bg-foreground/5 animate-pulse" />
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                  <div className="h-4 bg-foreground/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-3 bg-foreground/10 rounded-full w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-foreground/20" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button 
              onClick={() => {
                const params = new URLSearchParams()
                router.push(`/?${params.toString()}`, { scroll: false })
                window.location.href = '/'
              }}
              className="mt-6 px-6 py-2.5 bg-brand-purple text-white rounded-full font-medium hover:bg-brand-purple/90 transition-colors shadow-lg shadow-brand-purple/20"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 lg:gap-4"
          >
            {displayedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-50 dark:bg-gray-900/50"
              >
                <div 
                  className="relative aspect-[4/5] cursor-pointer overflow-hidden"
                  onClick={() => onProductClick({
                    ...product,
                    appliedOffer: filters.selectedOfferDetails ? {
                      name: filters.selectedOfferDetails.name,
                      type: filters.selectedOfferDetails.type,
                      value: filters.selectedOfferDetails.value
                    } : undefined
                  })}
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
                    <span className="absolute bottom-3 left-3 right-3 md:bottom-auto md:top-3 md:left-3 md:right-auto text-center md:text-left bg-white/95 dark:bg-violet-600/90 backdrop-blur-md text-violet-700 dark:text-white text-[10px] font-bold px-2 py-1.5 rounded-xl md:rounded-lg shadow-lg z-20 border border-violet-200/50 dark:border-violet-500/50">
                      {product.name.toLowerCase().includes('combo') ? '✨ COMBO' : `📦 PACK OF ${product.unitsPerPack}`}
                    </span>
                  ) : null}

                  {product.discount && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg z-20">
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
                    </div>
                  </div>
                </div>

                <div className="p-3 md:hidden">
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-brand-purple mb-1 uppercase tracking-wider opacity-80">{product.category}</p>
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
                        <div className="flex text-foreground/30 text-xs font-medium">
                          0 ★
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {hasMore && (
          <div ref={observerTarget} className="flex flex-col items-center justify-center mt-12 mb-8 gap-4">
            {loading && (
              <>
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-purple/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-brand-purple animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-foreground/50 animate-pulse">Loading more products...</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductGrid
