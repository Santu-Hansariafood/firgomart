"use client"

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, ShoppingBag, Tag } from 'lucide-react'
import OffersFilterChips from '@/components/ui/Filters/OffersFilterChips'
import { FilterControls, FilterPanel } from './ProductFilters'
import { Product } from '@/types/product'
import ProductCard from '@/components/ui/ProductCard/ProductCard'
import { ProductFilters, useProductFilters } from '@/hooks/product-grid/useProductFilters'
import { useProductData } from '@/hooks/product-grid/useProductData'
import { useGeolocation } from '@/hooks/product-grid/useGeolocation'
import { getSizeOptionsForCategory, allSizes, subcategoryOptionsFor } from '@/utils/productUtils'

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
  filters?: ProductFilters
  page?: number
  setPage?: React.Dispatch<React.SetStateAction<number>>
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  onProductClick, 
  onAddToCart, 
  initialCategory, 
  hideFilters = false, 
  newArrivals,
  filters: externalFilters,
  page: externalPage,
  setPage: externalSetPage
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const search = (searchParams.get('search') || '').trim()
  const category = initialCategory || (searchParams.get('category') || '').trim()
  const subcategory = (searchParams.get('subcategory') || '').trim()

  const { deliverToState, countryCode } = useGeolocation()
  
  const [internalPage, setInternalPage] = useState<number>(1)
  const internalFilters = useProductFilters(setInternalPage)

  const page = externalPage ?? internalPage
  const setPage = externalSetPage ?? setInternalPage
  const filters = externalFilters ?? internalFilters
  
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
    countryCode,
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
    <section className="min-h-screen pt-0 pb-12 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-brand-purple/5 dark:bg-brand-purple/20 -skew-y-3 transform origin-top-left -z-10" />
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-rose-500/5 dark:bg-rose-500/20 rounded-full blur-[80px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className={`flex flex-col md:flex-row items-center justify-between gap-6 ${category ? 'mt-2 mb-4' : 'mb-10'}`}>
          {!search && !category && (
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
            <div className="hidden md:block w-full md:w-auto z-10">
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
          <div className="hidden md:block mb-10">
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
          <div className="hidden md:block mb-8">
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
          <div className="mb-4 pb-3 border-b border-brand-purple/15">
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-brand-purple via-brand-red to-brand-purple opacity-70 mb-3" />
            <div
              className="
                flex items-center gap-3
                overflow-x-auto md:overflow-visible
                scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]
                flex-nowrap md:flex-wrap
              "
            >
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
                    className={`flex-none inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 transform active:scale-95 ${
                      active
                        ? 'bg-gradient-to-r from-brand-purple to-pink-500 text-white shadow-lg shadow-brand-purple/30 ring-2 ring-brand-purple ring-offset-2 ring-offset-background'
                        : 'bg-background/80 border border-foreground/10 text-foreground/70 hover:bg-brand-purple/5 hover:border-brand-purple/40 hover:text-brand-purple hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
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
                className="flex-none inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-sm font-medium bg-red-50/90 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap"
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
            {displayedProducts.map((product) => {
              const productWithOffer: Product = filters.selectedOfferDetails
                ? {
                    ...product,
                    appliedOffer: {
                      name: filters.selectedOfferDetails.name,
                      type: filters.selectedOfferDetails.type,
                      value: filters.selectedOfferDetails.value
                    }
                  }
                : product

              return (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                >
                  <ProductCard
                    product={productWithOffer}
                    onProductClick={onProductClick}
                    onAddToCart={onAddToCart}
                  />
                </motion.div>
              )
            })}
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
